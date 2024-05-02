## Change of Generative AI Model 
As this software heavily relies on Generative AI and this always is changing and under development. It is important to constantly do research around the the idea of using different Generative AI models like Gemini, Lambda or a different versions of GPT. Gemini would probaly be the best bet. As it can be toggled to only retunr a JSON file which is different from how the Assistant currenlty works which is just aksed nicely too return it as one.

|AI Model|Pros| Cons|
|--|--|--|
| Gemini | Very good and natural replies. Can return directly as a JSON | Expensive and currently very limited in how many countries it works in and how many times you can use it in a day. |
| OpenAI | Decent answers and cheap to run. Has no limits on how many times you can requests a day | Can be unreliable answers, especially in formatting the JSON right. The assistant has less features then gemini |
| Meta Llama| Open Source and can be ran locally. | While it can be ran locally and is pretty quick. It give more unreliable answers then OpenIA. And fails most of the time to get the JSON structure right. Which is crucial to the app. |
| Grok | Open Source an can be ran locally | Isn't meant for this kind of use case. Can be very political. Not Suitable for the app. |


    
## Prompt Engineering 
More research into what to tell the Assistant also needs to be constantly looked at. Prompt engineering is just as important as developing the software and would and will lead to better responses from the AI, which would directly improve the general user experience and the reliability of the answers it gives.
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
Currently the ChatGPT part of the App is the most fully fledged one. CSV need to be better implemented as it is right now quite bare bones. And only really extract locations from the text without giving any further explanation to it or generating any extra information related to it. This can be imrpoved by changing the Assistant used for this part of the project (There are different assistants for CSV and Text2Map) And general formatting of the inputted prompt for the user if they decide to upload a CSV files as this will not just show it raw and it does not look good.

## Embed Map 
This feature was wanted by Atlas so users could easily embed their made maps into their own websites or applications. But we ran out of time as we initally focused on getting the ChatGPT part to be stable as the CSV part hevily relied on backend code we made for it.