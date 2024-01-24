from fastapi import FastAPI, APIRouter
from openai import OpenAI

router = APIRouter()

client = OpenAI()

chat_history = []

@router.get("/askchat")
def getAskChat():
    return "GET method is not allowed for this endpoint. Please use the POST method."

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
    
    return {"Atlas GPT": content}


# Handle send message to chat
@router.get("/sendchat")
def getSendChat():
    print("GET method is not allowed for this endpoint. Please use the POST method.")
    return

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
    
    return {"Atlas GPT": content}

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
    
    return {"Atlas GPT": content, "chat_history": chat_history}
