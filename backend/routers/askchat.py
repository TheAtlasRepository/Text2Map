from fastapi import APIRouter
from openai import OpenAI
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
import pycountry
import random
import aiohttp
from aiohttp import ClientSession
import asyncio

router = APIRouter()

client = OpenAI()

chat_history = []

# Define a cache to store previously fetched geometries
geometry_cache = {}

# Define a semaphore to limit concurrent requests
semaphore = asyncio.Semaphore(5)  # Adjust the limit as needed

async def fetch_geojson(session: ClientSession, url: str) -> dict:
    async with semaphore:
        async with session.get(url) as response:
            return await response.json(content_type=None)

def create_chat_completion(model, messages, temperature, max_tokens, top_p, frequency_penalty, presence_penalty):
    prompt = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "top_p": top_p,
        "frequency_penalty": frequency_penalty,
        "presence_penalty": presence_penalty
    }

    return client.chat.completions.create(**prompt)
    
# Function to fetch geometry by ISO code from GeoBoundaries API
async def get_geometry_online(iso_code: str, adm_level: str, release_type: str = "gbOpen") -> shape:
    # Check if the geometry is already cached
    if iso_code in geometry_cache:
        return geometry_cache[iso_code]

    try:
        # Construct the GeoBoundaries API endpoint URL
        url = f"https://www.geoboundaries.org/api/current/{release_type}/{iso_code}/{adm_level}/"

        async with aiohttp.ClientSession() as session:
            # Make a GET request to the API
            async with session.get(url) as response:
                data = await response.json()

            # Check if the request was successful
            if response.status ==  200 and 'gjDownloadURL' in data:
                geojson_url = data['gjDownloadURL']
                geojson_data = await fetch_geojson(session, geojson_url)

                # Check if the GeoJSON request was successful
                if geojson_data and 'features' in geojson_data:
                    geometry = shape(geojson_data['features'][0]['geometry'])
                    # Cache the geometry for future use
                    geometry_cache[iso_code] = geometry
                    return geometry
            else:
                print(f"Failed to fetch geometry. Status code: {response.status}")
                return None
    except Exception as e:
        print(f"Error fetching geometry: {e}")
        return None

# Function to geocode an address using the openstreetmap API
async def geocode(address, iso_code):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"https://nominatim.openstreetmap.org/search?format=json&q={address}") as response:
                data = await response.json()

                if data:
                    location = data[0]['lat'], data[0]['lon']
                    return {"latitude": location[0], "longitude": location[1], "address": data[0]['display_name'], "iso_code": iso_code}
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


# Function to get ISO code for a country
def get_country_iso_code(country_name):
    try:
        country = pycountry.countries.get(name=country_name)
        if country:
            return country.alpha_3
        else:
            print(f"ISO code not found for country: {country_name}")
            return None
    except Exception as e:
        print(f"Error getting ISO code for country: {e}")
        return None

@router.post("/resetchat", response_model=dict)
async def postResetChat(message: str):
    global chat_history
    chat_history = [{"role": "user", "content": message}]
    response = await postSendChat(message)
    return {"entities": response["entities"], "chat_history": response["chat_history"][1:],
            "selected_countries_geojson_path": response["selected_countries_geojson_path"]}

@router.post("/sendchat", response_model=dict)
async def postSendChat(message):
    print("Sending message: " + message)
    global chat_history
    global geometry_cache

    messages = chat_history.copy()

    if not messages or (messages[-1]["role"] == "user" and messages[-1]["content"] != message):
        messages.append({"role": "user", "content": message})
        
    # Add a system message to prompt the assistant to mention city, state, and country
    messages.append({"role": "system", "content": "Please mention the city, state, and countrys ISO3 code like this (city, state, country ISO3 Code) for all places mentioned."})
    
    # Add a system message to prompt the assistant to talk a bit about the places mentioned
    messages.append({"role": "system", "content": "Can you tell me a bit about the places you mentioned?"})

    messages_for_openai = [
        {"role": msg["role"], "content": msg["content"]} for msg in messages
    ]

    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        create_chat_completion,
        "gpt-3.5-turbo",
        messages_for_openai,
        1,  # temperature
        1000,  # max_tokens
        1,  # top_p
        1,  # frequency_penalty
        0  # presence_penalty
    )

    assistant_response = response.choices[0].message.content

    if "user:" in message:
        messages.append({"role": "assistant", "content": assistant_response})
    else:
        messages.append({"role": "user", "content": message})
        messages.append({"role": "assistant", "content": assistant_response})

    chat_history = messages

    print("Received response: " + assistant_response)

    doc = ' '.join([msg["content"] for msg in messages])

    entities = []

    # Initialize country_geometries as an empty list
    country_geometries = []

    # Create a dictionary to map ISO codes to country names
    iso_to_country = {ent.alpha_3: ent.name for ent in pycountry.countries}

    # Run geocoding and geometry fetching concurrently
    tasks = []
    for ent in pycountry.countries:
        if ent.name in doc:
            iso_code = ent.alpha_3
            tasks.append(geocode(ent.name, iso_code))
            tasks.append(get_geometry(iso_code, "ADM0"))

    results = await asyncio.gather(*tasks)

    # Process the results
    for i in range(0, len(results),  2):
        geocode_result = results[i]
        geometry_result = results[i+1]
        if "error" not in geocode_result and geometry_result:
            # Get the current entity name using the ISO code
            current_entity_name = iso_to_country.get(geocode_result['iso_code'])
            if current_entity_name:
                print(f"Found country: {current_entity_name}, ISO Code: {geocode_result['iso_code']}")
                entities.append((
                    ("Found entities:", current_entity_name),
                    ("ISO Code:", geocode_result['iso_code']),
                    ("Latitude:", geocode_result["latitude"]),
                    ("Longitude:", geocode_result["longitude"])
                ))
                country_geometries.append(geometry_result)

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

    # Filter out system messages from the response
    filtered_messages = [msg for msg in messages if msg["role"] != "system"]
    
    # filter out the first user message from the response
    filtered_messages = filtered_messages[1:]

    return {"entities": entities, "chat_history": filtered_messages,
            "selected_countries_geojson_path": new_geojson}