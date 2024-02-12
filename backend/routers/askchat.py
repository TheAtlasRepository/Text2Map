from fastapi import APIRouter
from openai import OpenAI
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
import pycountry
import geocoder 
import requests

router = APIRouter()

client = OpenAI()

chat_history = []
    
# Function to fetch country geometry by ISO code from GeoBoundaries API
def get_country_geometry_online(iso_code, adm_level, release_type="gbOpen"):
    try:
        # Construct the GeoBoundaries API endpoint URL
        url = f"https://www.geoboundaries.org/api/current/{release_type}/{iso_code}/{adm_level}/"

        # Make a GET request to the API
        response = requests.get(url)
        data = response.json()

        # Check if the request was successful
        if response.status_code == 200:
            # Check if the 'gjDownloadURL' key is present in the response
            if 'gjDownloadURL' in data:
                # Fetch GeoJSON data from the provided URL
                geojson_url = data['gjDownloadURL']
                geojson_response = requests.get(geojson_url)
                
                # Check if the GeoJSON request was successful
                if geojson_response.status_code == 200:
                    # Extract the geometry from the GeoJSON response
                    geometry = shape(geojson_response.json()['features'][0]['geometry'])
                    return geometry
                else:
                    print(f"Failed to fetch GeoJSON. Status code: {geojson_response.status_code}")
                    return None
            else:
                print(f"Error: 'gjDownloadURL' key not found in the response.")
                return None
        else:
            # Print an error message if the request was not successful
            print(f"Failed to fetch country geometry. Status code: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error fetching country geometry: {e}")
        return None

def geocode(address):
    """Geocode an address string to lat/long and bounding box"""
    
    try:
        # Use the geocode method and specify the provider (in this case, Google)
        response = geocoder.arcgis(address)

        # Check if the geocoding was successful
        if response.ok:
            # Extract latitude and longitude from the first result
            coordinates = response.latlng
            latitude, longitude = coordinates[0], coordinates[1]

            return {"latitude": latitude, "longitude": longitude}
        else:
            print(f"Geocoding failed with status code: {response.status}")
            return {"error": "Geocoding failed"}
    
    except Exception as e:
        print(f"Error: {e}")
        return {"latitude": None, "longitude": None, "bbox": None}
    
# Function to fetch country geometry by ISO code from GeoBoundaries API
def get_country_geometry(iso_code):
    return get_country_geometry_online(iso_code, adm_level="ADM0")


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

# Function to fetch state geometry by ISO code from GeoBoundaries API
def get_state_geometry(iso_code):
    return get_country_geometry_online(iso_code, adm_level="ADM1")

# Function to get ISO code for a state within a country
def get_state_iso_code(state_name, country_iso_code):
    try:
        # Use the pycountry library to get the subdivisions of the specified country
        subdivisions = pycountry.subdivisions.get(country_code=country_iso_code)

        # Iterate through subdivisions to find the ISO code for the given state name
        for subdivision in subdivisions:
            if subdivision.name == state_name:
                return subdivision.code
        print(f"ISO code not found for state: {state_name}, country: {country_iso_code}")
        return None
    except Exception as e:
        print(f"Error getting ISO code for state: {e}")
        return None

# Function to fetch city geometry by ISO code from GeoBoundaries API
def get_city_geometry(iso_code):
    return get_country_geometry_online(iso_code, adm_level="ADM2")

# Function to get ISO code for a city within a state within a country
def get_city_iso_code(city_name, country_iso_code):
    try:
        # Construct the GeoBoundaries API endpoint URL for cities
        url = f"https://www.geoboundaries.org/api/current/gbOpen/{country_iso_code}/ADM2/"

        # Make a GET request to the API
        response = requests.get(url)
        data = response.json()

        # Check if the request was successful
        if response.status_code == 200:
            # Check if the city name is present in the response
            for feature in data.get('features', []):
                if city_name.lower() in feature.get('properties', {}).get('boundaryName', '').lower():
                    return feature.get('properties', {}).get('boundaryISO', None)
            
            print(f"City not found in GeoBoundaries data: {city_name}")
            return None
        else:
            # Print an error message if the request was not successful
            print(f"Failed to fetch city ISO code. Status code: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error fetching city ISO code: {e}")
        return None

@router.post("/resetchat", response_model=dict)
def postResetChat(message: str):
    global chat_history
    chat_history = [{"role": "user", "content": message}]
    # Run postSendChat to get the first response from the assistant
    response = postSendChat(message)
    
    # Return the chat history but without the first message
    return {"entities": response["entities"], "chat_history": response["chat_history"][1:], "selected_countries_geojson_path": response["selected_countries_geojson_path"]}

@router.post("/sendchat", response_model=dict)
def postSendChat(message):
    print("Sending message: " + message)
    global chat_history
    
    # Include chat history in messages
    messages = chat_history.copy()
    
    # Append the user's message only if it's not the same as the last one
    if not messages or (messages[-1]["role"] == "user" and messages[-1]["content"] != message):
        messages.append({"role": "user", "content": message})
    
    # Include the entire conversation history in the messages parameter
    messages_for_openai = [
        {"role": msg["role"], "content": msg["content"]} for msg in messages
    ]
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages_for_openai,
        temperature=1,
        max_tokens=1000,
        top_p=1,
        frequency_penalty=1,
        presence_penalty=0
    )
    
    # Get the assistant's response
    assistant_response = response.choices[0].message.content
    
    # Append each user question and assistant response separately to the chat history
    if "user:" in message:
        messages.append({"role": "assistant", "content": assistant_response})
    else:
        # If it's not a user question, append the entire message (potentially an intermediate prompt)
        messages.append({"role": "user", "content": message})
        messages.append({"role": "assistant", "content": assistant_response})
    
    # Update the chat history
    chat_history = messages
    
    print("Received response: " + assistant_response)

    # Check if your answer + chat history has a country, city, or state
    doc = ' '.join([msg["content"] for msg in messages])
    
    # Put all entities in a list
    entities = []
    
    # Extract countries with their ISO codes and search for cities within each country
    for ent in pycountry.countries:
        if ent.name in doc:
            if ent.name not in entities:
                # Get ISO code for the country
                iso_code = ent.alpha_3
                geocode_data_country = geocode(ent.name)
                if "error" in geocode_data_country:
                    print(f"Skipping invalid country: {ent.name}")
                else:
                    print(f"Found country: {ent.name}, ISO Code: {iso_code}")
                    entities.append((("Found entities:", ent.name), ("ISO Code:", iso_code), ("Latitude:", geocode_data_country["latitude"]), ("Longitude:", geocode_data_country["longitude"])))

                    # Search for states inside countries
                    
    
    # Extract ISO codes of countries from the entities
    iso_codes = [ent[1][1] for ent in entities]  # Adjust the index to get the ISO code directly

    # Look up country geometries from GeoJSON file
    country_geometries = [get_country_geometry(iso_code) for iso_code in iso_codes]

    # Create a new GeoJSON file with only the borders of the identified countries
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
    
    # Return the new GeoJSON file path to the frontend
    return {"entities": entities, "chat_history": chat_history, "selected_countries_geojson_path": new_geojson}