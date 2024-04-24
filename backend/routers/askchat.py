from fastapi import APIRouter
from openai import OpenAI
from shapely.geometry import shape, mapping, MultiPolygon, Polygon
from shapely.ops import unary_union
import aiohttp
from aiohttp import ClientSession
import asyncio
import os
import urllib
import re
import json
import urllib.parse
import unicodedata
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
    

    print("Running address_to_coordinates using address: ", address)
    encoded_address = urllib.parse.quote(address.encode('utf-8'), safe='')
    route_url = f"http://dev.virtualearth.net/REST/V1/Locations?q={encoded_address}&key={bing_maps_key}"
    
    async with aiohttp.ClientSession() as session:
        async with session.get(route_url) as response:
            data = await response.json()
    
    # Check if 'resourceSets' and 'resources' exist and are not empty
    if 'resourceSets' in data and data['resourceSets'] and 'resources' in data['resourceSets'][0] and data['resourceSets'][0]['resources']:
        
        # Check if "confidence" equals "High"
        # In case the first returned value has low conidence, look further
        resources_list = data['resourceSets'][0]['resources']

        resource = filter_by_highest_confidence(resources_list)
        if resource is None:
            # Return None if no resources are found 
            print("Found no high-confidence data on: ", address)

            return None
        
        print("This is the raw resource picked out from data: ", resource)

    else:
        # Return None if no resources are found
        print(f"No resources found for address: {address}")
        return None

    
    # Extract the coordinates
    coordinates = resource['point']['coordinates']
    
    # Safely extract the country region
    country_region = resource['address'].get('countryRegion')
    
    # Extracte formatted address
    formatted_address = resource['address'].get('formattedAddress').split(",")[0]
    
    # Determine the administrative level (ADM1 or ADM2)
    # This is a simplified approach and might need adjustment based on the actual data structure
    if 'PopulatedPlace' in resource['entityType'] or 'Neighborhood' in resource['entityType'] or 'Postcode1' in resource['entityType'] or 'AdminDivision2' in resource['entityType']:
        adm_level = "ADM2"
        print("The location has administrative level: ADM2")
    elif 'AdminDivision1' in resource['entityType']:
        adm_level = "ADM1"
        print("The location has administrative level: ADM1")
    elif 'CountryRegion' in resource['entityType']:
        adm_level = "ADM0"
        print("The location has administrative level: ADM0")
    else:
        adm_level = None
        print(f"Unknown administrative level: {resource['entityType']}")
    
    return { "coordinates": coordinates, "adm_level": adm_level, "country_region": country_region, "formatted_address": formatted_address}


def filter_by_highest_confidence(resources_list: list) -> list:
    """Looks through a list of resources to find first one of confidence "High" or "Medium"
    Confidence of "Low" is not accepted.

    Args:
        resources_list (list): List of json resources from Bing

    Returns:
        list: The resource with highest confidence
    """
    resource = None
    
    for res in resources_list:
        if (res['confidence'] == "High"):
            resource = res
            break
         
    if resource is None:
        # If no location meets confidence of high, go to medium
        for res in resources_list:
            if (res['confidence'] == "Medium"):
                resource = res
                break
            
    # Returne resource      
    # If no resource of high enough confidence is found, resource is None
    return resource




# Function to fetch geometry by ISO code from GeoBoundaries API
async def get_geometry(iso3: str, adm_level: str, address: str = "") -> shape:
    """Function for retrieving geometry for geobounderies

    Args:
        iso3 (str): The iso3 code for the country
        adm_level (str): The level of geometry to retrieve
        address (str, optional): Additional addres for use in searches in deeper adm levels. Defaults to "".

    Returns:
        shape: Geometry for geoboundery
    """
    print(f"Fetching geometry for {iso3} and {address} at {adm_level}")
    
    # If address is empty or unused, set it as address, mainly for display in print-commands
    if address == "":
        address = iso3

    if adm_level == "ADM0":
        url = f"https://geob-rust-api-cf77d36d0349.herokuapp.com/geojson?iso3={iso3}"
        print(f"URL: {url}")

    elif adm_level == "ADM1" or adm_level == "ADM2":
        # Format address to fit in url
        url_address = urllib.parse.quote(unicodedata.normalize('NFD', address.split(",")[0]), safe='')
        url = f"https://geob-rust-api-cf77d36d0349.herokuapp.com/geojson?iso3={iso3}&query={url_address}"
        print(f"URL: {url}")
    
    else:
        print(f"Error: Unsupported administrative level: {adm_level}")
        return None
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                data = await response.json()
            
            if response.status == 200 and 'geometry' in data:
                geometry = shape(data['geometry'])
                print(f"Fetched geometry for {address}")

                # Attempt to merge polygon when at ADM0
                if adm_level == "ADM0":
                    # If the geometry is a MultiPolygon, convert it to a Polygon
                    if isinstance(geometry, MultiPolygon):
                        # You can choose to merge all polygons into one, or handle it differently
                        # Here's an example of merging all polygons into one
                        geometry = unary_union(geometry)
                        if isinstance(geometry, Polygon):
                            print(f"Converted MultiPolygon to Polygon for {address}")
                        else:
                            print(f"Geometry remains MultiPolygon for {address}")

                return geometry

            # If the response gave an error, print response
            else:
                print("Failed to fetch geometry. Status code: ", response.status)
                print("Data: ", data)
                print("URL: ", url)
                return None

    except Exception as e:
        print(f"Error fetching geometry: {e}")
        return None



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
    
    # Send a message to the assistant
    formatted_messages = await requestToGPT(text, thread_id, "READER")
    
    # Run the value field through the processor
    response = await run_locations_through_prosessor(formatted_messages[0].get("message").get("locations"))
    
    
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

    # Run the value field through the processor
    response = await run_locations_through_prosessor(formatted_messages[0].get("message").get("locations"))
    
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
  
        if msg.role == "assistant":
            cleaned_content = gptResponseToJson(cleaned_content)
  
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
    
    # Parse the JSON string into a Python object
    try:
        response_data: dict = json.loads(str(input_messages))
    except json.JSONDecodeError as e:
        
        # Print the error response and the failed input
        print("Error parsing JSON: ", e)
        print("The input that failed: ", input_messages)
        
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
    added_addresses = set()
    
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
        if country is not None:
            # Joins the values together into one string, skipping the None values.
            address = ", ".join(filter(None, [city, state, country]))

            # Add address only if not already added
            if address not in combinations_to_search_with:
                print("Adding combined adress to queue: ", address)            
                combinations_to_search_with.add(address)
        
        # Unsure about this logic
        if (place != None or place == "") and place is not city and place is not state: # and city is not None:
            numb = all_places.count(place)

            # If the place belongs to a city, and is not a repeating tag added by GPT, add it to queue
            if numb <= 1:
                place_address = ", ".join(filter(None, [place]))
                
                # Add address only if not already added
                if place_address not in combinations_to_search_with:
                    print("Adding combined place to queue: ", place_address)
                    combinations_to_search_with.add(place_address)

        print(" ")

    # Go over every search query added to the list and gather data
    for search_string in combinations_to_search_with:

        #TODO: Ask Geojson api for data, and store based on info from Bing respons

        # First check if data is in cache
        if search_string in map_location_cache:
            data = map_location_cache[search_string]
            
            print('Retrieved data from cache using address: ', search_string)
        else: 
            try:
                # Use address_to_coordinates function to get coordinates
                data = await address_to_coordinates(search_string)
                
            except Exception as e:
                print(f"Error: {e}")

        # If no data is found, skip turn
        if data is None:
            continue
        
        # Save data in cache
        map_location_cache[search_string] = data

        # Get values from data
        latitude, longitude = data["coordinates"]
        adm_level = data["adm_level"]
        country_region = data["country_region"]
        formatted_address = data["formatted_address"]

        # if th elocation has already been added, skip 
        if formatted_address in added_addresses:
            continue

        # Construct a marker entity for frontend
        entities.append({
            "display_name": formatted_address, # This might need adjustment based on how you want to handle display names
            "lat": latitude,
            "lon": longitude
        })

        # Country level
        if adm_level == "ADM0":
            geometry = await get_geometry(country_region[:3], adm_level)
            if geometry is not None:
                country_geometries.append(geometry)

        # State or city level
        elif adm_level == "ADM1" or adm_level == "ADM2": 
            geometry = await get_geometry(country_region[:3], adm_level, formatted_address)
            if geometry is not None:
                if adm_level == "ADM1":
                    state_geometries.append(geometry)
                elif adm_level == "ADM2":
                    city_geometries.append(geometry)
 
        # If adm_level is None, do nothing
        
        print(" ")



    #iso_codes = [ent[1][1] for ent in entities if ent[0][0] == "Found entities:"]  # Filter entities for countries only
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
                    # "iso_code": iso_codes[i],
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
