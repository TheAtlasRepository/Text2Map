import requests
from fastapi import APIRouter
from openai import OpenAI
import spacy 
import json
import os

router = APIRouter()

client = OpenAI()

chat_history = []

nlp = spacy.load("en_core_web_lg")

# Get the current directory of the script
current_directory = os.path.dirname(os.path.abspath(__file__))

# Go up one level to reach the 'backend' directory
backend_directory = os.path.dirname(current_directory)

# Construct the path to the 'countries.json' file in the 'jsonFiles' directory
json_file_path = os.path.join(backend_directory, 'jsonFiles', 'countries.json')

# Load the JSON file with country data
with open(json_file_path) as file:
    COUNTRIES_DATA = json.load(file)
    
def get_invalid_country(country_name):
    """Get the country name if it is not in the list of countries."""
    
    if not any(country['name'] == country_name for country in COUNTRIES_DATA):
        return country_name
    else:
        return None

def geocode(address):
    """Geocode an address string to lat/long and bounding box"""
    
    response = requests.get("https://api.mapbox.com/search/geocode/v6/forward?q="+address+"&access_token=pk.eyJ1IjoiZWlyaWtzYiIsImEiOiJjbHJjMTlqd28wbnF5MmtzMHpnbHZ5Nmx6In0.CGZFHEdOICWywo5B5Kzl9g")
    
    json_data = response.json()

    
    try:
        # Access the features array
        features = json_data.get('features', [])

        if features:
            # Extract latitude and longitude from the first feature
            coordinates = features[0]['geometry']['coordinates']
            latitude, longitude = coordinates[1], coordinates[0]

            # Check if the country is valid
            country_name = features[0]['properties']['name']
            if country_name in [country['name'] for country in COUNTRIES_DATA]:
                print(f"Skipping country in exclusion list: {country_name}")
                return {"error": "Excluded country"}
            else:
                return {"latitude": latitude, "longitude": longitude}
        else:
            print("No features found in the response.")
            return {"error": "No features in the response"}
    
    except Exception as e:
        print(f"Error: {e}")
        return {"latitude": None, "longitude": None, "bbox": None}

@router.post("/resetchat", response_model=dict)
def postResetChat(message: str):
    global chat_history
    chat_history = [{"role": "user", "content": message}]
    # Run postSendChat to get the first response from the assistant
    response = postSendChat(message)
    
    # Return the chat history but without the first message
    return {"entities": response["entities"], "chat_history": response["chat_history"][1:]}

@router.post("/sendchat", response_model=dict)
def postSendChat(message):
    print("Sending message: " + message)
    messages = chat_history.copy()  # Include chat history in messages
    
    system = "You are a helpful GIS expert and History major. Only mention countries that currently exist."
    
    messages.append({"role": "user", "content": message})
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": system
            },
            {
                "role": "user",
                "content": messages[-2]["content"]
            }
        ],
        temperature=1,
        max_tokens=1000,
        top_p=1,
        frequency_penalty=1,
        presence_penalty=0
    )
    
    # Filter out the user's message from being added after the assistant's response
    filtered_messages = [message for message in messages if message["role"] == "assistant"] + [{"role": "user", "content": message}]
    
    content = response.choices[0].message.content 
    
    # Find the index where the assistant's response is located in the chat history
    assistant_response_index = next((i for i, message in enumerate(messages) if message["role"] == "assistant"), None)

    # Add the chat history to the content
    if assistant_response_index is not None:
        content += "\n".join([f"{message['role']}: {message['content']}" for message in filtered_messages[assistant_response_index + 1:]])
    else:
        content  # Add a default message if assistant response is not found


    
    print("Received response: " + content)
    
    chat_history.append({"role": "user", "content": message})  # Add current message to chat history
    chat_history.append({"role": "assistant", "content": content})  # Add assistant's response to chat history

    
    # Check if you asnwer + chat history has a country, city or state
    doc = nlp(content)
    
    # Put all entities in a list
    entities = []
    
    for ent in doc.ents:
        # Should also check if the label and text are already in the list and in the right order. And dont repeat the same entity
        if ent.label_ == "GPE":
            # Check if the entity is already in the list
            entity =  ent.text
            if entity not in entities:
                geocode_data = geocode(ent.text)
                if "error" in geocode_data:
                    # Handle invalid country (you may skip it or log a message)
                    print(f"Skipping invalid country: {entity}")
                else:
                    entities.append((("Found entities:", entity), ("Latitude:", geocode_data["latitude"]), ("Longitude:", geocode_data["longitude"])))

           
    
    return {"entities": entities, "chat_history": chat_history[1:]}
