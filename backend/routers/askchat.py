from fastapi import APIRouter
from openai import OpenAI
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
import pycountry
import spacy
import aiohttp
from aiohttp import ClientSession
import asyncio

router = APIRouter()

client = OpenAI()

chat_history = []

# Download the spaCy English language model

# Load the spaCy English language model
nlp = spacy.load("en_core_web_trf")

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
async def geocode(address, iso_code, subdivision_name=None):
    try:
        async with aiohttp.ClientSession() as session:
            if subdivision_name:
                async with session.get(f"https://nominatim.openstreetmap.org/search?format=json&q={address}") as response:
                    data = await response.json()

                    if data:
                        location = data[0]['lat'], data[0]['lon']
                        return {"latitude": location[0], "longitude": location[1], "address": data[0]['display_name'], "iso_code": iso_code}
                    else:
                        print(f"Geocoding failed for address: {address}")
                        return {"error": "Geocoding failed"}
            else:
                async with session.get(f"https://nominatim.openstreetmap.org/search?format=json&q={address}, {iso_code}") as response:
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
async def get_geometry(iso_code, adm_level, subdivision_name=None):
    geometry = await get_geometry_online(iso_code, adm_level, subdivision_name)
    return geometry


# Function to get ISO code for a country
def get_country_iso_code(country_name):
    try:
        country = pycountry.countries.get(name=country_name)
        if country:
            return country.alpha_3
        else:
            subdivision = pycountry.subdivisions.get(name=country_name)
            if subdivision:
                return subdivision.country.alpha_3
            else:
                print(f"ISO code not found for entity: {country_name}")
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
    
    # Create a dictionary mapping country names to ISO codes
    iso_to_country = {country.name: country.alpha_3 for country in pycountry.countries}

    # Process the document with spaCy
    doc = nlp(doc)

    # Extract named entities
    entities = [(ent.text, ent.label_) for ent in doc.ents]

    # Filter entities to get only country, state, and city names
    country_names = [ent[0] for ent in entities if ent[1] == 'GPE' and ent[0] in iso_to_country]
    state_names = [ent[0] for ent in entities if ent[1] == 'GPE' and ent[0] in pycountry.subdivisions]
    city_names = [ent[0] for ent in entities if ent[1] == 'GPE' and ent[0] not in iso_to_country and ent[0] not in pycountry.subdivisions]

    # Initialize lists to store geometries
    country_geometries = []
    state_geometries = []
    city_geometries = []

    # Fetch geometries for countries
    for country_name in country_names:
        iso_code = get_country_iso_code(country_name)
        if iso_code:
            country_geometry = await get_geometry(iso_code, "ADM0")
            if country_geometry:
                country_geometries.append(country_geometry)

    # Fetch geometries for states
    for state_name in state_names:
        # You need to determine the ISO code and the subdivision level for states
        # This may require additional logic or data sources
        state_geometry = await get_geometry(iso_code, "ADM1", state_name)
        if state_geometry:
            state_geometries.append(state_geometry)

    # Fetch geometries for cities
    for city_name in city_names:
        # Fetching geometries for cities can be more complex due to the large number of cities
        # You may need to use a different API or data source that provides city boundaries
        # This may also require additional logic to match city names to the correct boundaries
        city_geometry = await get_geometry(iso_code, "ADM2", city_name)
        if city_geometry:
            city_geometries.append(city_geometry)

    # Combine all geometries into a single GeoJSON feature collection
    features = []
    for geometry in country_geometries + state_geometries + city_geometries:
        if geometry.is_valid:
            feature = {
                "type": "Feature",
                "properties": {
                    "name": geometry.name,  # You may need to adjust this to get the correct name
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

    return {"entities": entities, "chat_history": chat_history,
            "selected_countries_geojson_path": new_geojson}