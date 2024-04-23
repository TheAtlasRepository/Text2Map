from fastapi import APIRouter
from openai import OpenAI
from shapely.geometry import shape, mapping, MultiPolygon, Polygon
from shapely.ops import unary_union
import pycountry
import aiohttp
from aiohttp import ClientSession
import asyncio
import os
import urllib
import re
import json
import urllib.parse
import unicodedata
from geopy.exc import GeocoderTimedOut
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

openai_api_key = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=openai_api_key)


chat_assistant = client.beta.assistants.retrieve("asst_adZiTCNOb0TH56032BKlXc5I")
reader_assistant = client.beta.assistants.retrieve("asst_vCdrvpZmGFeNdjKv7VnPmUXc")
bing_maps_key = "Akp4jrj9Y3XZZmmVVwpiK2Op2v7wB7xaHr4mqDWOQ8xD-ObvUUOrG_4Xae2rYiml"


# Define a cache to store previously fetched geometries
map_location_cache = {}

# Define a semaphore to limit concurrent requests
semaphore = asyncio.Semaphore(5)  # Adjust the limit as needed

async def fetch_geojson(session: ClientSession, url: str) -> dict:
    async with semaphore:
        async with session.get(url) as response:
            return await response.json(content_type=None)
       
async def address_to_coordinates(address: str) -> dict:
    """Function for fetching data from Bing REST Api relating to inputted address

    Args:
        address (str): The location string to search after

    Returns:
        dict: Collection of location-data from Bing. Includes:
            [coordinates, adm_level, country_region, formatted_address]
    """
    

    print("Running address_to_coordinates using: ", address)
    encoded_address = urllib.parse.quote(address.encode('utf-8'), safe='')
    route_url = f"http://dev.virtualearth.net/REST/V1/Locations?q={encoded_address}&key={bing_maps_key}"
    
    async with aiohttp.ClientSession() as session:
        async with session.get(route_url) as response:
            data = await response.json()
    
    # Check if 'resourceSets' and 'resources' exist and are not empty
    if 'resourceSets' in data and data['resourceSets'] and 'resources' in data['resourceSets'][0] and data['resourceSets'][0]['resources']:
        resource = data['resourceSets'][0]['resources'][0]
        print("This is the raw resource picked out from data: ", resource)
    else:
        print(f"No resources found for address: {address}")
        return None, None, None, None, None # Return None for all values if no resources are found

    
    # Extract the coordinates
    coordinates = resource['point']['coordinates']
    
    # Safely extract the country region
    country_region = resource['address'].get('countryRegion')
    
    # Extracte formatted address
    formatted_address = resource['address'].get('formattedAddress').split(",")[0]
    
    # Determine the ISO3 code of the country
    iso3 = address_to_iso_code(country_region)
    print(f"ISO3 for {country_region}: {iso3} : {formatted_address}")
    
    # Determine the administrative level (ADM1 or ADM2)
    # This is a simplified approach and might need adjustment based on the actual data structure
    if 'PopulatedPlace' in resource['entityType'] or 'Neighborhood' in resource['entityType'] or 'Postcode1' in resource['entityType'] or 'AdminDivision2' in resource['entityType']:
        adm_level = "ADM2"
        print(f"ADM2")
    elif 'AdminDivision1' in resource['entityType']:
        adm_level = "ADM1"
        print(f"ADM1")
    elif 'CountryRegion' in resource['entityType']:
        adm_level = "ADM0"
        print(f"ADM0")
    else:
        adm_level = None
        print(f"Unknown administrative level: {resource['entityType']}")
    
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
async def get_geometry_online(address: str) -> shape:
    if address is None:
        print("Error: Address is None")
        return None
    print(f"Fetching geometry for {address}")
    # Extract ISO3 code from the address string
    iso3_match = re.search(r',\s*([A-Z]{3})', address)
    if iso3_match:
        coordinates, iso3, adm_level, country_region, formatted_address = await address_to_coordinates(address)
        iso3 = iso3_match.group(1)
    else:
        # If ISO3 code is not found in the address, fallback to using address_to_coordinates
        coordinates, iso3, adm_level, country_region, formatted_address = await address_to_coordinates(address)
        if not iso3:
            print(f"ISO3 code not found in address: {address}")
            return None
        
    print(f"ISO3: {iso3})")

    if adm_level == "ADM0":
        try:
            url = f"https://geob-rust-api-cf77d36d0349.herokuapp.com/geojson?iso3={iso3}"
            print(f"URL: {url}")
                
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    data = await response.json()

                if response.status == 200 and 'geometry' in data:
                    geometry = shape(data['geometry'])
                    print(f"Fetched geometry for {formatted_address}")

                    # If the geometry is a MultiPolygon, convert it to a Polygon
                    if isinstance(geometry, MultiPolygon):
                        # You can choose to merge all polygons into one, or handle it differently
                        # Here's an example of merging all polygons into one
                        geometry = unary_union(geometry)
                        if isinstance(geometry, Polygon):
                            print(f"Converted MultiPolygon to Polygon for {formatted_address}")
                        else:
                            print(f"Failed to convert MultiPolygon to Polygon for {formatted_address}")

                    return geometry                   
                else:
                    print(f"Failed to fetch geometry. Status code: {response.status}")
                    print(f"Data: {data}")
                    print(f"URL: {url}")
                    return None
        except Exception as e:
            print(f"Error fetching geometry: {e}")
            return None       
    elif adm_level == "ADM1" or adm_level == "ADM2":
        try:
            address = address.split(",")[0]
            address = unicodedata.normalize('NFD', address)
            address = urllib.parse.quote(address, safe='')
            url = f"https://geob-rust-api-cf77d36d0349.herokuapp.com/geojson?iso3={iso3}&query={address}"
            print(f"URL: {url}")
                
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    data = await response.json()

                if response.status == 200 and 'geometry' in data:
                    geometry = shape(data['geometry'])
                    print(f"Fetched geometry for {formatted_address}")
                    return geometry                
                else:
                    print(f"Failed to fetch geometry. Status code: {response.status}")
                    print(f"Data: {data}")
                    print(f"URL: {url}")
                    return None
        except Exception as e:
            print(f"Error fetching geometry: {e}")
            return None
    else:
        print(f"Error: Unsupported administrative level: {adm_level}")
        return None

async def geocode_with_retry(address, retries=3, delay=2):
    for i in range(retries):
        try:
            return await geocode(address)
        except GeocoderTimedOut:
            print(f"Geocoding failed for {address}. Retrying...")
            await asyncio.sleep(delay)
    return {"error": "Geocoding failed"}

# Function to geocode an address 
async def geocode(address):
    # Check if address is None and handle accordingly
    if address is None:
        print("Address is None")
        return {"error": "Address is None"}
    
    print('Is the address for ' + address +' in cache? ', address in map_location_cache)

    # First check if data is in cache
    if address in map_location_cache:
        print('Retrieved data from cache using address: ', address)
        
        data = map_location_cache[address]
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
            map_location_cache[formatted_address] = response_data
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
        print(f"Fetching geometry for {address}")
        geometry = await get_geometry_online(address)
    else:
        print("Error: Address is not provided")
        geometry = None
    
    return geometry

# Function for handeling manual text input
@router.post("/newText", response_model=dict)
async def postNewText(text: str) -> dict:
    """Send text to the assistant and have locations extracted

    Args:
        text (str): Text with locations

    Returns:
        dict: Object with entities and geojson paths
    """
    
    
    print("Sending text: " + text)

    # Create a new thread
    thread_id = client.beta.threads.create().id
    # print the thread_id
    print(f"Thread ID: {thread_id}")
    formatted_messages = await requestToGPT(text, thread_id, "READER")
    response_data = gptResponseToJson(formatted_messages)

    response = await run_locations_through_prosessor(response_data.get("locations"))
    
    # Return the new GeoJSON file path to the frontend
    return {
        "entities": response["entities"],
        "selected_countries_geojson_path": response["selected_countries_geojson_path"]
        }

# Function for handeling start of a chat with Gpt
# TODO: Make a pydantic model for the response schema
@router.post("/newChat", response_model=dict)
async def postNewChat(message: str) -> dict:
    """Send a message to the assistant and return the response.
    
    Args:
        message (str): The message to send to the assistant

    Returns:
        dict: The response from GPT, and includes entities, selected_countries_geojson_path, chat_history, and thread_id
    """
    
    
    # Create a new thread id
    thread_id = client.beta.threads.create().id
    # print the thread_id
    print(f"Thread ID: {thread_id}")
    # Pass the thread_id to postMoreChat
    response = await postMoreChat(message, thread_id)
    
    
    return {
        "entities": response["entities"],
        "selected_countries_geojson_path": response["selected_countries_geojson_path"],
        "chat_history": response["chat_history"],
        "thread_id": thread_id
    }

# Function for handeling chat with Gpt
# TODO: Make a pydantic model for the response schema
@router.post("/moreChat", response_model=dict)
async def postMoreChat(message: str, thread_id: str) -> dict:
    """Send a message to the assistant and return the response.
    
    Args:
        message (str): The message to send to the assistant
        thread_id (str): The id of the thread to send the message to

    Returns:
        dict: The response from the assistant, and includes entities, selected_countries_geojson_path, chat_history, and thread_id
    """
    
    print("Sending message: " + message + " to thread " + thread_id)

    # Send a message to the assistant
    formatted_messages = await requestToGPT(message, thread_id, "CHAT")
    response_data = gptResponseToJson(formatted_messages)

    # Run the value field through the processor
    response = await run_locations_through_prosessor(response_data.get("locations"))
    
    return {
        "entities": response["entities"],
        "selected_countries_geojson_path": response["selected_countries_geojson_path"],
        "chat_history": formatted_messages
    }



async def requestToGPT(text: str, thread_id: str, mode: str = "CHAT") -> list:
    """Function for sending messages to gpt assistant, based on mode

    Args:
        text (str): The text to send to GPT
        thread_id (str): The threadId to use for the request
        mode (str, optional): The mode for handeling the text. Defaults to "CHAT".
            "CHAT" answers questions and finds locations. 
              
            "READER" responds with the locations found in the text

    Returns:
        list: The respons from GPT
    """
    
    # Send a message to the assistant
    msg = client.beta.threads.messages.create(thread_id, role="user", content=text)
    
    # Run the assistant based on mode
    if(mode == "CHAT"): 
      run = client.beta.threads.runs.create(thread_id, assistant_id=chat_assistant.id)
    elif(mode == "READER"):
      run = client.beta.threads.runs.create(thread_id, assistant_id=reader_assistant.id)

    # Display status for the request
    while run.status != "completed":
        keep_retrieving_run = client.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run.id
        )
        print(f"Run status: {keep_retrieving_run.status} on thread {thread_id}")

        if keep_retrieving_run.status == "completed":
            print("\n")
            break
        elif keep_retrieving_run.status == "failed":
            print("Run failed. Stopping...")
            break
    
    all_messages = client.beta.threads.messages.list(thread_id=thread_id)
    
    # Extract and format the messages
    formatted_messages = []
    for msg in all_messages.data:
        # Access the text value of the message content
        message_text = msg.content[0].text.value
        # Remove newline characters and large spaces
        cleaned_content = re.sub(r'\s{2,}', ' ', message_text.replace("\n", " ").replace('" "', '", "'))
        formatted_messages.append({
            "sender": "assistant" if msg.role == "assistant" else "user",
            "message": cleaned_content
        })
    
    print (f"Assistant response: {formatted_messages}")
    return formatted_messages


def gptResponseToJson(input_messages: str) -> dict:
    """Takes a formated response from GPT, presumably in a stringified Json format

    Args:
        input_messages (str): The formated response from GPT

    Returns:
        dict: The locations from the response
    """
    # Assuming formatted_messages is a list of dictionaries
    assistant_response_json = input_messages[0]['message']
    
    # Parse the JSON string into a Python object
    try:
        response_data: dict = json.loads(str(assistant_response_json))
    except json.JSONDecodeError as e:
        
        # Print the error response and the failed input
        print("Error parsing JSON: ", e)
        print("The input that failed: ", assistant_response_json)
        
    return response_data





# Text processor for extracting and finding locations from text
async def run_locations_through_prosessor(locations: list) -> dict:
    """Function for prosessing the locations into coordinates and geodata, and grouping it together.

    Args:
        input_locations (dict): Json-formated collection of locations

    Returns:
        dict: Dictionary of entity and geojason data
    """
    
    # Variable to hold the collection of coordinates for locations and entities
    entities = []
    
    # Initialize a set to track processed countries
    # Storage
    combinations_to_search_with = set()
    all_places = []

    # Initialize country_geometries as an empty list
    country_geometries = []
    state_geometries = []
    city_geometries = []


    # Store the places for checking duplicates
    for location in locations:
        place = location.get("place")

        if place != None or place != "":
            all_places.append(place)

    # Extract and process each location
    for location in locations:
        country = location.get("country") # Iso3 code
        state = location.get("state")
        city = location.get("city")
        place = location.get("place")


        #create searchable addresses based on logic
        #TODO: Create some logic for 

        if country is None:
            print("Missing a country value: ", location)
        elif state is None and city is None:
            # singular_places.add(place)
            print("Found a lone place: ", place)

        # If things are in order, add location to search. 
        # Prioritize City, then State, and lastly Country.
        if country is not None:
            # Joins the values together into one string, skipping the None values.
            address = ", ".join(filter(None, [country, state, city]))

            # Add address only if not already added
            if address not in combinations_to_search_with:
                print("Adding combined adress to queue: ", address)            
                combinations_to_search_with.add(address)
        
        # Unsure about this logic
        if (place != None or place == "") and place is not city and place is not state: # and city is not None:
            numb = all_places.count(place)

            # If the place belongs to a city, and is not a repeating tag added by GPT, add it to queue
            if numb <= 1:
                place_address = ", ".join(filter(None, [country, state, city, place]))
                
                # Add address only if not already added
                if place_address not in combinations_to_search_with:
                    print("Adding combined place to queue: ", place_address)
                    combinations_to_search_with.add(place_address)



  

    # Combine the results of country and city tasks
    country_results = await asyncio.gather(*country_tasks)
    state_results = await asyncio.gather(*state_tasks)
    city_results = await asyncio.gather(*city_tasks)
    places_results = await asyncio.gather(*places_tasks)

    # Process the results for countries
    for i in range(0, len(country_results), 2):
        geocode_result = country_results[i]
        geometry_result = country_results[i + 1]
        if "error" not in geocode_result and geometry_result:
            # Check if 'display_name' exists in the geocode_result
            current_entity_name = geocode_result.get('address', 'Unknown')  # Use 'address' instead of 'display_name'
            if current_entity_name and current_entity_name not in processed_countries:
                coordinates, iso3, adm_level, country_region, formatted_address = await address_to_coordinates(current_entity_name)  # Use the updated function
                if iso3:
                    print(f"Found country: {current_entity_name}")
                    entities.append((
                        ("Found entities:", current_entity_name),
                        ("Latitude:", geocode_result["latitude"]),
                        ("Longitude:", geocode_result["longitude"])
                    ))
                     # Add the current country to the set of processed countries
                    processed_countries.add(current_entity_name)
                    country_geometries.append(geometry_result)
                    # Complete the set of mentioned country ISO codes
                    print(f"Finished processing country: {current_entity_name}")
                    
    # Process the results for states
    for i in range(0, len(state_results), 2):
        geocode_result = state_results[i]
        geometry_result = state_results[i + 1]
        if "error" not in geocode_result and geometry_result:
            # Check if 'display_name' exists in the geocode_result
            current_entity_name = geocode_result.get('address', 'Unknown')
            if current_entity_name and current_entity_name not in processed_places:
                coordinates, iso3, adm_level, country_region, formatted_address = await address_to_coordinates(current_entity_name)
                if formatted_address:
                    print(f"Found state: {current_entity_name}")
                    entities.append((
                        ("Found entities:", current_entity_name),
                        ("Latitude:", geocode_result["latitude"]),
                        ("Longitude:", geocode_result["longitude"])
                    ))
                    # Add the current state to the set of processed states
                    processed_places.add(current_entity_name)
                    state_geometries.append(geometry_result)
                    print(f"Finished processing state: {current_entity_name}")
    

    # Process the results for cities
    for i in range(0, len(city_results), 2):
        geocode_result = city_results[i]
        geometry_result = city_results[i + 1]
        if "error" not in geocode_result and geometry_result:
            # Check if 'display_name' exists in the geocode_result
            current_entity_name = geocode_result.get('address', 'Unknown')
            if current_entity_name and current_entity_name not in processed_places:
                coordinates, iso3, adm_level, country_region, formatted_address = await address_to_coordinates(current_entity_name)  # Use the updated function
                if formatted_address:
                    print(f"Found city: {current_entity_name}")
                    entities.append((
                        ("Found entities:", current_entity_name),
                        ("Latitude:", geocode_result["latitude"]),
                        ("Longitude:", geocode_result["longitude"])
                    ))
                    # Add the current city to the set of processed cities
                    processed_places.add(current_entity_name)
                    city_geometries.append(geometry_result)
                    print(f"Finished processing city: {current_entity_name}")
    
    # Process the results for places
    for i in range(0, len(places_results), 2):
        geocode_result = places_results[i]
        if "error" not in geocode_result:
            # Check if 'display_name' exists in the geocode_result
            current_entity_name = geocode_result.get('address', 'Unknown')
            if current_entity_name and current_entity_name not in processed_places:
                print(f"Found place: {current_entity_name}")
                entities.append((
                    ("Found entities:", current_entity_name),
                    ("Latitude:", geocode_result["latitude"]),
                    ("Longitude:", geocode_result["longitude"])
                ))
                # Add the current place to the set of processed places
                processed_places.add(current_entity_name)
                print(f"Finished processing place: {current_entity_name}")


    iso_codes = [ent[1][1] for ent in entities if ent[0][0] == "Found entities:"]  # Filter entities for countries only
    country_geometries = [shape(geo) for geo in country_geometries]
    state_geometries = [shape(geo) for geo in state_geometries]
    city_geometries = [shape(geo) for geo in city_geometries]

    # Ensure that the geometry objects are valid before mapping also set a color for each country
    features = []
    for i, geometry in enumerate(country_geometries):
        if geometry.is_valid:
            feature = {
                "type": "Feature",
                "properties": {
                    "name": "Country",
                    "fill": "#0F58FF",
                    "iso_code": iso_codes[i],
                    "style": {
                        "fillColor": "#0F58FF",
                        "strokeColor": "#000000",  # Black outline
                        "fillOpacity":  0.5,
                        "strokeWidth":  1
                    }
                },
                "geometry": mapping(geometry)
            }
            features.append(feature)
            
    for i, geometry in enumerate(state_geometries):
        if geometry.is_valid:
            feature = {
                "type": "Feature",
                "properties": {
                    "name": "State",
                    "fill": "#FFA500",
                    "style": {
                        "fillColor": "#FFA500",
                        "strokeColor": "#000000",  # Black outline
                        "fillOpacity":  0.5,
                        "strokeWidth":  1
                    }
                },
                "geometry": mapping(geometry)
            }
            features.append(feature)
    
    for i, geometry in enumerate(city_geometries):
        if geometry.is_valid:
            feature = {
                "type": "Feature",
                "properties": {
                    "name": "City",
                    "fill": "#008000",
                    "style": {
                        "fillColor": "#008000",
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


    # Return the new GeoJSON file path to the frontend
    return {
        "entities": entities, 
        "selected_countries_geojson_path": new_geojson
        }
