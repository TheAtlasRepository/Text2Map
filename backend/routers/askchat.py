from fastapi import APIRouter
from openai import OpenAI
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
import pycountry
import geocoder 
import json
import os

router = APIRouter()

client = OpenAI()

chat_history = []
text_history = []

# Get the absolute path to the GeoJSON file with country borders
geojson_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'jsonFiles', 'countries.geojson'))

# Load GeoJSON file with country borders
with open(geojson_file_path) as geojson_file:
    countries_geojson = json.load(geojson_file)

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
    
def get_country_geometry(iso_code):
    for feature in countries_geojson['features']:
        geo_iso_code = feature['properties']['ISO_A3'].strip().upper()  # Handle case sensitivity and whitespace
        if geo_iso_code == iso_code:
            print(f"Found geometry for ISO code {iso_code}")
            return shape(feature['geometry'])
    print(f"Geometry not found for ISO code {iso_code}")
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
    
    for ent in pycountry.countries:
        if ent.name in doc:
            if ent.name not in entities:
                # Get ISO code for the country
                iso_code = ent.alpha_3
                geocode_data = geocode(ent.name)
                if "error" in geocode_data:
                    print(f"Skipping invalid country: {ent.name}")
                else:
                    print(f"Found country: {ent.name}, ISO Code: {iso_code}")
                    entities.append((("Found entities:", ent.name), ("ISO Code:", iso_code), ("Latitude:", geocode_data["latitude"]), ("Longitude:", geocode_data["longitude"])))
    
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

@router.post("/newText", response_model=dict)
def postNewText(text: str):
    print("Sending text: " + text)
    global text_history
    
    text_history = [text]

    # Run postSendChat to get the first response from the assistant
    response = postSendMoreText(text)
    
    # Return the chat history but without the first message
    return {"entities": response["entities"], "text_history": response["text_history"][1:], "selected_countries_geojson_path": response["selected_countries_geojson_path"]}


@router.post("/sendMoreText", response_model=dict)
def postSendMoreText(text):
    print("Sending text: " + text)
    global text_history
    
    # Include chat history in textEntities
    textEntities = text_history.copy()

    # Append the text only if it's not the same as the last one
    if not textEntities or (textEntities[-1] != text):
        textEntities.append(text)

    # Update the chat history
    text_history = textEntities

    # Check if your answer + chat history has a country, city, or state
    doc = ' '.join([textEnt for textEnt in textEntities])

    # Put all entities in a list
    entities = []

    for ent in pycountry.countries:
        if ent.name in doc:
            if ent.name not in entities:
                # Get ISO code for the country
                iso_code = ent.alpha_3
                geocode_data = geocode(ent.name)
                if "error" in geocode_data:
                    print(f"Skipping invalid country: {ent.name}")
                else:
                    print(f"Found country: {ent.name}, ISO Code: {iso_code}")
                    entities.append((("Found entities:", ent.name), ("ISO Code:", iso_code), ("Latitude:", geocode_data["latitude"]), ("Longitude:", geocode_data["longitude"])))
    
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

    return {"entities": entities, "text_history": text_history, "selected_countries_geojson_path": new_geojson}