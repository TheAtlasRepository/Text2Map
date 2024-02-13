from fastapi import APIRouter
from openai import OpenAI
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
import pycountry
import geocoder
import aiohttp
import requests
import asyncio
import json

router = APIRouter()

client = OpenAI()

chat_history = []

async def fetch_geojson(session, url):
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
    
# Function to fetch country geometry by ISO code from GeoBoundaries API
async def get_country_geometry_online(iso_code, adm_level, release_type="gbOpen"):
    try:
        # Construct the GeoBoundaries API endpoint URL
        url = f"https://www.geoboundaries.org/api/current/{release_type}/{iso_code}/{adm_level}/"

        async with aiohttp.ClientSession() as session:
            # Make a GET request to the API
            async with session.get(url) as response:
                data = await response.json()

                # Check if the request was successful
                if response.status == 200:
                    # Check if the 'gjDownloadURL' key is present in the response
                    if 'gjDownloadURL' in data:
                        geojson_url = data['gjDownloadURL']
                        geojson_data = await fetch_geojson(session, geojson_url)

                        # Check if the GeoJSON request was successful
                        if geojson_data and 'features' in geojson_data:
                            geometry = shape(geojson_data['features'][0]['geometry'])
                            return geometry
                        else:
                            print(f"Failed to fetch GeoJSON. Data: {geojson_data}")
                            return None
                    else:
                        print(f"Error: 'gjDownloadURL' key not found in the response.")
                        return None
                else:
                    # Print an error message if the request was not successful
                    print(f"Failed to fetch country geometry. Status code: {response.status}")
                    return None
    except Exception as e:
        print(f"Error fetching country geometry: {e}")
        return None

async def geocode(address):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine={address}") as response:
                data = await response.json()

                if 'candidates' in data and data['candidates']:
                    location = data['candidates'][0]['location']
                    return {"latitude": location['y'], "longitude": location['x']}
                else:
                    print(f"Geocoding failed for address: {address}")
                    return {"error": "Geocoding failed"}
    except Exception as e:
        print(f"Error: {e}")
        return {"latitude": None, "longitude": None, "bbox": None}

    
# Function to fetch country geometry by ISO code from GeoBoundaries API
async def get_country_geometry(iso_code):
    return await get_country_geometry_online(iso_code, adm_level="ADM0")


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

    entities = []

    for ent in pycountry.countries:
        if ent.name in doc:
            if ent.name not in entities:
                iso_code = ent.alpha_3
                geocode_data_country = await geocode(ent.name)
                if "error" in geocode_data_country:
                    print(f"Skipping invalid country: {ent.name}")
                else:
                    print(f"Found country: {ent.name}, ISO Code: {iso_code}")
                    entities.append(
                        (("Found entities:", ent.name), ("ISO Code:", iso_code), ("Latitude:", geocode_data_country["latitude"]),
                         ("Longitude:", geocode_data_country["longitude"])))

    iso_codes = [ent[1][1] for ent in entities]

    country_geometries = [await get_country_geometry(iso_code) for iso_code in iso_codes]

    new_geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"ISO_A3": iso_code},
                "geometry": mapping(geometry) if geometry else None
            }
            for iso_code, geometry in zip(iso_codes, country_geometries)
        ]
    }

    return {"entities": entities, "chat_history": chat_history,
            "selected_countries_geojson_path": new_geojson}