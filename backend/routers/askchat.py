import requests
from fastapi import APIRouter
from openai import OpenAI
import spacy 

router = APIRouter()

client = OpenAI()

chat_history = []

nlp = spacy.load("en_core_web_lg")

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

            return {"latitude": latitude, "longitude": longitude}
        else:
            print("No features found in the response.")
            return {"error": "No features in the response"}
    
    except:
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
    
    messages.append({"role": "user", "content": message})
    
    response = client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=messages,
        temperature=1,
        max_tokens=1000,
        top_p=1,
        frequency_penalty=1,
        presence_penalty=0
    )
    
    content = response.choices[0].message.content
    
    print("Received response: " + content)
    
    chat_history.append({"role": "user", "content": message})  # Add current message to chat history
    chat_history.append({"role": "assistant", "content": content})  # Add assistant's response to chat history
    
    # Check if you asnwer has a country, city or state
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
                entities.append((("Found entities:", entity), ("Latitude:", geocode_data["latitude"]), ("Longitude:", geocode_data["longitude"])))
           
    
    return {"entities": entities, "chat_history": chat_history[1:]}
