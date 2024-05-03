# Future Improvements

This document provides some thoughts and suggestions for future improvements for the application.

## Change of Generative AI Model 
As this software heavily relies on Generative AI and this always is changing and under development: It is important to constantly do research around the the idea of using different Generative AI models like Gemini, Lambda or a different versions of GPT. Gemini would probaly be the best bet as it can be toggled to only return a JSON file, which is different from how the Assistant currenlty works as it is only asked nicely to return it as one.

|AI Model|Pros| Cons|
|--|--|--|
| Gemini | Very good and natural replies. Can return directly as a JSON | Expensive and currently very limited in how many countries it works in and how many times you can use it in a day. |
| OpenAI | Decent answers and cheap to run. Has no limits on how many times you can requests a day | Can be unreliable answers, especially in formatting the JSON right. The assistant has less features then gemini |
| Meta Llama| Open Source and can be ran locally. | While it can be ran locally and is pretty quick. It give more unreliable answers then OpenIA. And fails most of the time to get the JSON structure right. Which is crucial to the app. |
| Grok | Open Source and can be ran locally | Isn't meant for this kind of use case. Can be very political. Not Suitable for the app. |


    
## Prompt Engineering 
More research into what to tell the Assistant also needs to be looked at further. Prompt engineering is just as important as developing the software and would and will lead to better responses from the AI, which would directly improve the general user experience and the reliability of the answers it gives.
Currently this prompt seems to give the most reliable and best answers while maintaining the JSON Structure.

    You are a text interpreter tasked with providing informative responses. You also do have access to a Map and if you are questioned to show where on a map something is you will explain it. You will fill the Information with a medium but insightful and informational response an you will return every place with a each own item inside the locations list.
    
    Final Output Requirement:
    
    {
    "Information: "Information",
    "locations": [
        {
          "country": "ISO3",
          "state": "State or Region",
          "city": "City Name",
          "place": "Specific Place"
        }
      ]
    }
    Please don’t write anything in your reply outside of this JSON and keep every comma as instructed. And do not fill the locations with anything but a locations, and only a Single country. And add every location that is mentioned in informations in the format I have requested.
But I belive this can be further engineered to give even better answers.

## CSV Feature 
Currently the ChatGPT part of the App is the most fully fledged one. CSV need to be better implemented as the current solution is quite bare bones, and only really extracts locations from the text without giving much extra information or further explanations related to them. 

This can be improved by changing the Assistant used for this part of the project (There are different assistants for CSV and Text2Map), in addition to changing the general formatting of the inputted prompt from the user if they decide to upload a CSV files, as the current solution for formatting might not look good.

## Embed Map 
This feature was requested so that users could easily embed their generated maps into their own websites or applications. This functionality has not yet been implemented, but to do so would in our opinion require two things:
1. For data to be stored somewere persistently.
2. Implement two dedicated page-displays for displaying stored data:
    - One with the text at the side of the map, 
    - One with only the map. 
    - Additionally without options for editing, and without the navigational bar at the top.