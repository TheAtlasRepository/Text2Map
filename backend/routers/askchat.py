from fastapi import FastAPI, APIRouter
from openai import OpenAI
import os

router = APIRouter()
os.environ["OPENAI_API_KEY"] = "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"
client = OpenAI()

@router.get("/askchat")
def getAskChat():
    return "GET method is not allowed for this endpoint. Please use the POST method."

@router.post("/askchat", response_model=dict)
def postAskChat(question):
    # TODO: Implement this function
    response = client.chat.completions.create(
        model="gpt-4-1106-preview",
        messages=[
            {
            "role": "system",
            "content": "You are a helpful GIS expert and History major. You will answer the given prompts in a short but informative way. "
            },
            {
            "role": "user",
            "content": question
            }
        ],
        temperature=1,
        max_tokens=1000,
        top_p=1,
        frequency_penalty=1,
        presence_penalty=0
    )
    
    # Get the input fromm the json response
    
    
    content = response.choices[0].message.content
    
    return {"Atlas GPT": content}


# Handle send message to chat
@router.get("/sendchat")
def getSendChat():
    print("GET method is not allowed for this endpoint. Please use the POST method.")
    return

@router.post("/sendchat", response_model=dict)
def postSendChat(message):
    
    response = client.chat.completions.create(
        model="gpt-4-1106-preview",
        messages=[
            {
            "role": "user",
            "content": message
            }
        ],
        temperature=1,
        max_tokens=1000,
        top_p=1,
        frequency_penalty=1,
        presence_penalty=0
    )
    
    # Get the input fromm the json response
    
    
    content = response.choices[0].message.content
    
    return {"Atlas GPT": content}

# Get the chat history
@router.get("/getJsonData")
def getJsonData():
    
    response = client.chat.completions.create(
        model="gpt-4-1106-preview",
        messages=[
            {
            "role": "system",
            "content": "You are a helpful GIS expert and History major. You will answer the given prompts in a short but informative way. "
            }
        ],
        temperature=1,
        max_tokens=1000,
        top_p=1,
        frequency_penalty=1,
        presence_penalty=0
    )
    
    # Get the input fromm the json response
    
    
    content = response.choices[0].message.content
    
    return {"Atlas GPT": content}
