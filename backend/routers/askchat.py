from fastapi import APIRouter
from openai import OpenAI
import spacy

router = APIRouter()

client = OpenAI()

chat_history = []

nlp = spacy.load("en_core_web_lg")

@router.post("/askchat", response_model=dict)
def postAskChat(question):
    # TODO: Implement this function
    messages = [
        {"role": "system", "content": "You are a helpful GIS expert and History major. You will answer the given prompts in a short but informative way."},
        {"role": "user", "content": question}
    ]
    
    messages.extend(chat_history)  # Include chat history in messages
    
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
    
    chat_history.append({"role": "user", "content": question})  # Add current question to chat history
    
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
                entities.append(entity)
           
    
    return {"GPT": content, "entities": entities}

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
                entities.append(entity)
           
    
    return {"GPT": content, "entities": entities}

# Get the chat history
@router.get("/getJsonData")
def getJsonData():
    messages = [
        {"role": "system", "content": "You are a helpful GIS expert and History major. You will answer the given prompts in a short but informative way."}
    ]
    
    messages.extend(chat_history)  # Include chat history in messages
    
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
    
    return {"GPT": content, "chat_history": chat_history}
