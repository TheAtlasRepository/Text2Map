import React from 'react';
import { JsonChatHistory } from '../types/BackendResponse';

type JsonRendererProps = {
  jsonChatHistory: JsonChatHistory[]; // Replace 'any' with the actual type of your jsonData
};

const errorMessage = (
  <div className="border rounded-lg border-red-500 p-3 text-red-500">
    Something wrong happened. <br />No text was found.
  </div>
)

/**
 * Renders the respons retrieved from backend
 * @param jsonChatHistory The chat history from the backend 
 * @returns A collection of paragraphs displaying the chat history
 */
const JsonRenderer: React.FC<JsonRendererProps> = ({ jsonChatHistory }) => {
  if (!jsonChatHistory) {
    return errorMessage;
  }

  if (Array.isArray(jsonChatHistory) && jsonChatHistory.length > 0) {
    const formattedContent = jsonChatHistory.map((item, index) => {
      const role = item.sender === 'user' ? 'User' : 'Assistant';
      const message_value = item.message;
      let message = "";

      // Determine if the message is a string or an object
      if (typeof message_value == "object") {
        message = message_value.Information;
      } else if (typeof message_value == 'string') {
        message = message_value;
      }

      return <p className="pb-3" key={index}><strong>{role}:</strong> {message}</p>;
    }).reverse();

    return <>{...formattedContent}</>;
  }

  return errorMessage;
};

export default JsonRenderer;