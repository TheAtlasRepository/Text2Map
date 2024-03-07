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
import os
import spacy

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
    
# Function to fetch geometry by ISO code from GeoBoundaries API
async def get_geometry_online(iso_code: str, adm_level: str, release_type: str = "gbOpen") -> shape:
    # Check if the geometry is already cached
    if iso_code in geometry_cache:
        print('Retrieved geometry from cache using iso_code: ', iso_code)
        return geometry_cache[iso_code]

    try:
        # Construct the GeoBoundaries API endpoint URL
        url = f"https://www.geoboundaries.org/api/current/{release_type}/{iso_code}/{adm_level}/"

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
                    geometry_cache[iso_code] = geometry
                    print(f"Fetched geometry for {iso_code}")
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
            text = ent.text
            print('Entity and label: ', ent.text, ',', ent.label_)
            
            # Cut off 'The' to improve the process for searching
            if text.title().startswith('The '): 
                text = text[4:]
                print('Cut text: ', text)

            cities_and_places.append(text)

    print(' ')
    return set(cities_and_places)

async def geocode_with_retry(address, retries=3, delay=2):
    for i in range(retries):
        try:
            return await geocode(address)
        except GeocoderUnavailable as e:
            if i < retries - 1: # i is zero indexed
                await asyncio.sleep(delay) # wait before retrying
            else:
                raise e

# Function to geocode a city using the openstreetmap API
async def geocode_city(city_name):
    try:
        geolocator = Nominatim(user_agent="city-extractor")
        location = geolocator.geocode(city_name)
        
        # For some reason, geolocator messes up language somehow. Returns labels in native language, as oposed to english
        print('Geocoding city using name: ', city_name, ', and got: ', location)

        if location:
            return {"latitude": location.latitude, "longitude": location.longitude, "address": location.address}
        else:
            print(f"Geocoding failed for address: {city_name}")
            return {"error": "Geocoding failed"}
    except Exception as e:
        print(f"Error: {e}")
        return {"latitude": None, "longitude": None, "address": None, "error": "Geocoding failed"}



# Function to geocode an address using the openstreetmap API
async def geocode(address):
    print('Is the adress for ' + address +' in cache? ', address in openStreetmap_cache)

    # First check if data is in cache
    if address in openStreetmap_cache:
        print('Retrieved data from cache using address: ', address)
        
        data = openStreetmap_cache[address]
        #print('Data: ', data)
        return {"latitude": data['lat'], "longitude": data['lon'], "address": data['display_name']}

    try:
        async with aiohttp.ClientSession() as session:
            # limit=1 limits the api to return a single element in the JSON 
            # accept-language=en-US tells the api what language is prefered
            # polygon_geojson=! tells teh api to return geojson bounderies
            async with session.get(f"https://nominatim.openstreetmap.org/search?limit=1&accept-language=en-US&format=json&q={address}") as response:
                data = await response.json()
                
                # Set first item from response as data
                data = data[0]
                
                if data:
                    # Save data in cache
                    openStreetmap_cache[address] = data
                    return {"latitude": data['lat'], "longitude": data['lon'], "address": data['display_name'] }
                else:
                    print(f"Geocoding failed for address: {address}")
                    return {"error": "Geocoding failed"}
    except Exception as e:
        print(f"Error: {e}")
        return {"latitude": None, "longitude": None, "address": None, "error": "Geocoding failed"}

    
# Function to fetch country geometry by ISO code from GeoBoundaries API
async def get_geometry(iso_code, adm_level):
    geometry = await get_geometry_online(iso_code, adm_level)
    
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
        formatted_messages.append({
            "sender": "assistant" if msg.role == "assistant" else "user",
            "message": msg.content[0].text.value
        })
    
    print (f"Assistant response: {formatted_messages}")
    
    # Run the value field through the processor
    response = await run_text_through_prosessor(str(all_messages))
    
    
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

    # Extract country ISO codes first
    for ent in pycountry.countries:
        if ent.name in doc:
            iso_code = ent.alpha_3
            mentioned_country_iso_codes.add(iso_code)  # Track mentioned country ISO codes
            country_tasks.append(geocode_with_retry(ent.name))
            country_tasks.append(get_geometry(iso_code, "ADM0"))

    # Extract city information
    for city in places_mentioned_in_doc:
        city_tasks.append(geocode(city))

    # Combine the results of country and city tasks
    country_results = await asyncio.gather(*country_tasks)
    city_results = await asyncio.gather(*city_tasks)

    # Process the results for countries
    for i in range(0, len(country_results), 2):
        geocode_result = country_results[i]
        geometry_result = country_results[i + 1]
        if "error" not in geocode_result and geometry_result:
            # Check if 'display_name' exists in the geocode_result
            current_entity_name = geocode_result.get('display_name', 'Unknown')
            if current_entity_name:
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

    iso_codes = [ent[1][1] for ent in entities]
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
