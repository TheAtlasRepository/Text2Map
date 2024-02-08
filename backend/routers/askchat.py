import requests
from fastapi import APIRouter
from openai import OpenAI
import spacy
import geocoder 

router = APIRouter()

client = OpenAI()

chat_history = []

nlp = spacy.load("en_core_web_lg")

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
    doc = nlp(' '.join([msg["content"] for msg in messages]))
    
    # Put all entities in a list
    entities = []
    
    for ent in doc.ents:
        if ent.label_ == "GPE":
            entity = ent.text
            if entity not in entities:
                geocode_data = geocode(ent.text)
                if "error" in geocode_data:
                    print(f"Skipping invalid country: {entity}")
                else:
                    entities.append((("Found entities:", entity), ("Latitude:", geocode_data["latitude"]), ("Longitude:", geocode_data["longitude"])))
    
    return {"entities": entities, "chat_history": chat_history}