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
    return response.json()

@router.post("/sendchat", response_model=dict)
def postSendChat(message):
    messages = chat_history.copy()  # Include chat history in messages
    
    messages.append({"role": "user", "content": message})
    
    response = client.chat.completions.create(
        model="gpt-4-1106-preview",
        messages=messages,
        temperature=1,
        max_tokens=1000,
        top_p=1,
        frequency_penalty=1,
        presence_penalty=0
    )
    
    content = response.choices[0].message.content
    
    chat_history.append({"role": "user", "content": message})  # Add current message to chat history
    chat_history.append({"role": "assistant", "content": content})  # Add assistant's response to chat history
    
    # Check if you asnwer has a country, city or state
    doc = nlp(content)
    
    # Put all entities in a list
    entities = []
    
    for ent in doc.ents:
        # Should also check if the label and text are already in the list and in the right order. And dont repeat the same entity
        if ent.label_ == "GPE" or ent.label_ == "LOC" or ent.label_ == "FAC":
            # Check if the entity is already in the list
            entity = ent.label_ + ": " + ent.text
            if entity not in entities:
                geocode_data = geocode(ent.text)
                entities.append((("Found entities:", entity),("GeoData:", geocode_data)))
           
    
    return {"entities": entities, "chat_history": chat_history[1:]}
