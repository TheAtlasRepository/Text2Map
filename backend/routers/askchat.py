from fastapi import APIRouter
from openai import OpenAI
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
import pycountry
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderUnavailable
import aiohttp
from aiohttp import ClientSession
import asyncio
import json
import urllib
import spacy
import re
from geopy.exc import GeocoderTimedOut


router = APIRouter()

client = OpenAI()

chat_history = []

nlp = spacy.load("en_core_web_trf")

my_assistant = client.beta.assistants.retrieve("asst_eKL7g3MCeUtwaD0CjC9VBv7p")

geolocator = Nominatim(user_agent="city-extractor")

# Define a cache to store previously fetched geometries
geometry_cache = {}
openStreetmap_cache = {}

# Define a semaphore to limit concurrent requests
semaphore = asyncio.Semaphore(5)  # Adjust the limit as needed

async def fetch_geojson(session: ClientSession, url: str) -> dict:
    async with semaphore:
        async with session.get(url) as response:
            return await response.json(content_type=None)
       
async def address_to_coordinates(address, bing_maps_key = "Akp4jrj9Y3XZZmmVVwpiK2Op2v7wB7xaHr4mqDWOQ8xD-ObvUUOrG_4Xae2rYiml"):
    encoded_address = urllib.parse.quote(address.encode('utf-8'), safe='')
    route_url = f"http://dev.virtualearth.net/REST/V1/Locations?q={encoded_address}&key={bing_maps_key}"
    
    async with aiohttp.ClientSession() as session:
        async with session.get(route_url) as response:
            data = await response.json()
    
    # Check if 'resourceSets' and 'resources' exist and are not empty
    if 'resourceSets' in data and data['resourceSets'] and 'resources' in data['resourceSets'][0] and data['resourceSets'][0]['resources']:
        resource = data['resourceSets'][0]['resources'][0]
    else:
        print(f"No resources found for address: {address}")
        return None, None, None, None, None # Return None for all values if no resources are found

    
    # Extract the coordinates
    coordinates = resource['point']['coordinates']
    
    # Safely extract the country region
    country_region = resource['address'].get('countryRegion')
    
    # Extracte formatted address
    formatted_address = resource['address'].get('formattedAddress')

    
    # Determine the ISO3 code of the country
    iso3 = address_to_iso_code(country_region)
    print(f"ISO3 for {country_region}: {iso3}")
    
    # Determine the administrative level (ADM1 or ADM2)
    # This is a simplified approach and might need adjustment based on the actual data structure
    if 'adminDistrict' in resource['address']:
        adm_level = "ADM1"
        print(f"ADM1: {resource['address']['adminDistrict']}")
    elif 'adminDistrict2' in resource['address']:
        adm_level = "ADM2"
        print(f"ADM2: {resource['address']['adminDistrict2']}")
    else:
        adm_level = "ADM0"
    
    return coordinates, iso3, adm_level, country_region, formatted_address


def address_to_iso_code(country_name):
    # Check if country_name is None
    if country_name is None:
        return None
    # Convert the country name to uppercase for case-insensitive matching
    country_name = country_name.upper()

    # Check if the country name is a valid pycountry country name
    try:
        country = pycountry.countries.lookup(country_name)
        return country.alpha_3
    except LookupError:
        # Handle special cases where the country name is not recognized by pycountry
        if country_name == "RUSSIA":
            return "RUS"
        return None
    
# Function to fetch geometry by ISO code from GeoBoundaries API
async def get_geometry_online(address: str, adm_level: str = "ADM0", release_type: str = "gbOpen") -> shape:
    if address is None:
        print("Error: Address is None")
        return None
    print(f"Fetching geometry for {address}")
    coordinates, iso3, adm_level, country_region, formatted_address = await address_to_coordinates(address)
    print(f"ISO3: {iso3}, ADM level: {adm_level}")
    # Check if the geometry is already cached
    if iso3 in geometry_cache:
        print('Retrieved geometry from cache using iso_code: ', iso3)
        return geometry_cache[iso3]

    # Run if ADM level is ADM0
    if adm_level == "ADM0":
        try:
            # Construct the GeoBoundaries API endpoint URL
            url = f"https://www.geoboundaries.org/api/current/{release_type}/{iso3}/{adm_level}/"

            async with aiohttp.ClientSession() as session:
                # Make a GET request to the API
                async with session.get(url) as response:
                    data = await response.json()

                # Check if the request was successful
                if response.status ==  200 and 'simplifiedGeometryGeoJSON' in data:
                    geojson_url = data['simplifiedGeometryGeoJSON']
                    geojson_data = await fetch_geojson(session, geojson_url)

                    # Check if the GeoJSON request was successful
                    if geojson_data and 'features' in geojson_data:
                        geometry = shape(geojson_data['features'][0]['geometry'])
                        # Cache the geometry for future use
                        geometry_cache[iso3] = geometry
                        print(f"Fetched geometry for {iso3}")
                        return geometry
                else:
                    print(f"Failed to fetch geometry. Status code: {response.status}")
                    return None
        except Exception as e:
            print(f"Error fetching geometry: {e}")
            return None

# Function to extract cities and places from the user's input using SpaCy
def extract_cities(text):
    doc = nlp(text)
    cities_and_places = []

    for ent in doc.ents:
        if ent.label_ in ["GPE", "LOC", "FAC"]:
            text = ent.text.strip()

            # Check if the text starts with 'The '
            if text.title().startswith('The '):
                text = text[4:].strip()

            # Use regular expression to remove additional characters or digits
            cleaned_text = re.sub(r'\.\s*\d+', '', text)

            # Filter out country names
            iso_code = address_to_iso_code(cleaned_text)
            if iso_code and pycountry.countries.get(alpha_3=iso_code):
                continue

            cities_and_places.append(cleaned_text)

    return set(cities_and_places)

# Extract countries from the assistant's response
def extract_countries(text):
    # Process the text
    doc = nlp(text)
    
    # Extract countries
    countries = [ent.text for ent in doc.ents if ent.label_ == "GPE"]

    return set(countries)

async def geocode_with_retry(address, retries=3, delay=2):
    for i in range(retries):
        try:
            return await geocode(address)
        except GeocoderUnavailable as e:
            if i < retries - 1: # i is zero indexed
                await asyncio.sleep(delay) # wait before retrying
            else:
                raise e

# Function to geocode an address 
async def geocode(address):
    # Check if address is None and handle accordingly
    if address is None:
        print("Address is None")
        return {"error": "Address is None"}
    
    print('Is the address for ' + address +' in cache? ', address in openStreetmap_cache)

    # First check if data is in cache
    if address in openStreetmap_cache:
        print('Retrieved data from cache using address: ', address)
        
        data = openStreetmap_cache[address]
        #print('Data: ', data)
        return {"latitude": data['lat'], "longitude": data['lon'], "address": data['display_name']}

    try:
        # Use address_to_coordinates function to get coordinates
        coordinates, iso3, adm_level, country_region, formatted_address = await address_to_coordinates(address)
        if coordinates:
            # Assuming coordinates is a tuple (latitude, longitude)
            latitude, longitude = coordinates
            # Construct a response similar to what you would get from the API
            response_data = {
                "lat": latitude,
                "lon": longitude,
                "display_name": formatted_address # This might need adjustment based on how you want to handle display names
            }
            # Save data in cache
            openStreetmap_cache[formatted_address] = response_data
            return {"latitude": latitude, "longitude": longitude, "address": formatted_address}
        else:
            print(f"Geocoding failed for address: {formatted_address}")
            return {"error": "Geocoding failed"}
    except Exception as e:
        print(f"Error: {e}")
        return {"latitude": None, "longitude": None, "address": None, "error": "Geocoding failed"}

    
# Function to fetch country geometry by ISO code from GeoBoundaries API
async def get_geometry(address):
    if address is not None:
        geometry = await get_geometry_online(address)
    else:
        print("Error: Address is not provided")
        geometry = None
    
    return geometry

# Function for handeling manual text input
@router.post("/newText", response_model=dict)
async def postNewText(text: str):
    print("Sending text: " + text)

    response = await run_text_through_prosessor(text)
    
    # Return the new GeoJSON file path to the frontend
    return {
        "entities": response["entities"],
        "selected_countries_geojson_path": response["selected_countries_geojson_path"]
        }

# Function for handeling start of a chat with Gpt
# TODO: Make a pydantic model for the response schema
@router.post("/newChat", response_model=dict)
async def postNewChat(message: str):
    """
    # Send a message to the assistant and return the response.
    
    ## Arguments
    - message the message to send to the assistant
    ## Return: 
    - returns the response from the assistant as a dictionary which includes the entities, selected_countries_geojson_path, chat_history, and thread_id
    """
    
    global chat_history
    # Create a new thread
    new_thread = client.beta.threads.create() 
    chat_history = [{"role": "user", "content": message}]
    # create a global variable to store the thread_id
    thread_id = new_thread.id
    # print the thread_id
    print(f"Thread ID: {thread_id}")
    # Pass the thread_id to postMoreChat
    response = await postMoreChat(message, thread_id)
    chat_history.append({"role": "assistant", "content": response["chat_history"][-1]["message"]})

    return {
        "entities": response["entities"],
        "selected_countries_geojson_path": response["selected_countries_geojson_path"],
        "chat_history": response["chat_history"],
        "thread_id": thread_id
    }

# Function for handeling chat with Gpt
# TODO: Make a pydantic model for the response schema
@router.post("/moreChat", response_model=dict)
async def postMoreChat(message: str, thread_id: str):
    """
    # Send a message to the assistant and return the response.
    
    ## Arguments
    - message the message to send to the assistant
    - thread_id the id of the thread to send the message to
    ## Return: 
    - returns the response from the assistant as a dictionary which includes the entities, selected_countries_geojson_path, chat_history, and thread_id
    """
    print("Sending message: " + message + " to thread " + thread_id)

    # Send a message to the assistant
    msg = client.beta.threads.messages.create(thread_id, role="user", content=message)
    
    # Run the assistant
    run = client.beta.threads.runs.create(thread_id, assistant_id=my_assistant.id)
    
    while run.status != "completed":
        keep_retrieving_run = client.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run.id
        )
        print(f"Run status: {keep_retrieving_run.status} on thread {thread_id}")

        if keep_retrieving_run.status == "completed":
            print("\n")
            break
    
    all_messages = client.beta.threads.messages.list(thread_id=thread_id)
    
    # Extract and format the messages
    formatted_messages = []
    for msg in all_messages.data:
        # Access the text value of the message content
        message_text = msg.content[0].text.value
        # Remove newline characters and replace them with spaces
        cleaned_content = message_text.replace("\n", " ")
        formatted_messages.append({
            "sender": "assistant" if msg.role == "assistant" else "user",
            "message": cleaned_content
        })
    
    print (f"Assistant response: {formatted_messages}")

    
    # Run the value field through the processor
    response = await run_text_through_prosessor(str(formatted_messages))
    
    
    return {
        "entities": response["entities"],
        "selected_countries_geojson_path": response["selected_countries_geojson_path"],
        "chat_history": formatted_messages
    }


# Text processor for extracting and finding locations from text
async def run_text_through_prosessor(doc):
    global geometry_cache

    entities = []

    # Initialize country_geometries as an empty list
    country_geometries = []
    
    # Extract city names mentioned in the user's input
    places_mentioned_in_doc = list(extract_cities(doc))
    
    # Keep track of ISO codes of the countries mentioned in the user's input
    mentioned_country_iso_codes = set()
    
    print (f"Cities mentioned in the user's input: {places_mentioned_in_doc}")

    # Run geocoding, geometry fetching, and city information fetching concurrently
    country_tasks = []
    city_tasks = []
    
    unique_countries = set(list(extract_countries(doc)))
    
    for city in places_mentioned_in_doc:
        try:
            # Call your function to get coordinates, ISO3 code, and administrative level
            coordinates, iso3, adm_level, country_region, formatted_address = await address_to_coordinates(city)
            city_tasks.append(geocode(city))
        except Exception as e:
            print(f"Error fetching coordinates for city: {city}. Error: {e}")

    print(f"Unique countries: {unique_countries}")
    
    # Extract country ISO codes first
    for country in unique_countries:
        coordinates, iso3, adm_level, country_region, formatted_address = await address_to_coordinates(country)
        mentioned_country_iso_codes.add(iso3)  # Track mentioned country ISO codes
        country_tasks.append(geocode_with_retry(country_region))
        country_tasks.append(get_geometry(formatted_address))

    # Combine the results of country and city tasks
    country_results = await asyncio.gather(*country_tasks)
    city_results = await asyncio.gather(*city_tasks)

    # Process the results for countries
    for i in range(0, len(country_results), 2):
        geocode_result = country_results[i]
        geometry_result = country_results[i + 1]
        if "error" not in geocode_result and geometry_result:
            # Check if 'display_name' exists in the geocode_result
            current_entity_name = geocode_result.get('address', 'Unknown')  # Use 'address' instead of 'display_name'
            if current_entity_name:
                coordinates, iso3, adm_level, country_region, formatted_address = await address_to_coordinates(current_entity_name)  # Use the updated function
                if iso3:
                    print(f"Found country: {current_entity_name}")
                    entities.append((
                        ("Found entities:", current_entity_name),
                        ("Latitude:", geocode_result["latitude"]),
                        ("Longitude:", geocode_result["longitude"])
                    ))
                    country_geometries.append(geometry_result)

    # Process the results for cities
    for city_result in city_results:
        if "error" not in city_result:
            city_name = city_result.get('address', '').split(',')[0].strip()
            print(f"Found city: {city_name}")
            entities.append((
                ("Found entities:", city_name),
                ("Latitude:", city_result["latitude"]),
                ("Longitude:", city_result["longitude"])
            ))
        else:
            address = city_result.get('address', 'Unknown')
            print(f"Geocoding failed for city: {address}")

    iso_codes = [ent[1][1] for ent in entities if ent[0][0] == "Found entities:"]  # Filter entities for countries only
    country_geometries = [shape(geo) for geo in country_geometries]

    # Ensure that the geometry objects are valid before mapping also set a color for each country
    features = []
    for i, geometry in enumerate(country_geometries):
        if geometry.is_valid:
            feature = {
                "type": "Feature",
                "properties": {
                    "iso_code": iso_codes[i],
                    "style": {
                        "fillColor": "#000000",
                        "strokeColor": "#000000",  # Black outline
                        "fillOpacity":  0.5,
                        "strokeWidth":  1
                    }
                },
                "geometry": mapping(geometry)
            }
            features.append(feature)

    new_geojson = {
        "type": "FeatureCollection",
        "features": features
    }


    # Clear geometry_cache for entries not used recently
    geometry_cache = {iso_code: geometry for iso_code, geometry in geometry_cache.items() if iso_code in iso_codes}

    # Return the new GeoJSON file path to the frontend
    return {
        "entities": entities, 
        "selected_countries_geojson_path": new_geojson
        }
