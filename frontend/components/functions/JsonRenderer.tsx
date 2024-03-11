import React from 'react';

type JsonRendererProps = {
 jsonData: any; // Replace 'any' with the actual type of your jsonData
};

const JsonRenderer: React.FC<JsonRendererProps> = ({ jsonData }) => {
  if (!jsonData) {
    return null;
  }

 const gptContent = jsonData.GPT ? <p><strong>GPT:</strong> {jsonData.GPT}</p> : '';
 const chatHistory = jsonData.chat_history;

 if (Array.isArray(chatHistory) && chatHistory.length > 0) {
    const formattedContent = chatHistory.map((item, index) => {
      const role = item.sender === 'user' ? 'User' : 'Assistant';
      return <p key={index}><strong>{role}:</strong> {item.message}</p>;
    });

    // Combine all the React components
    const reactContent = [gptContent, ...formattedContent];

    return <>{reactContent}</>;
 }

 return null;
};

export default JsonRenderer;