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
    const initialContent = chatHistory[0].content || '';
    const formattedContent = chatHistory
      .slice(1)
      .map((item, index) => {
        const role = item.role === 'user' ? 'User' : 'Assistant';
        const content =
          typeof item.content === 'object' ? item.content.content : item.content;
        return <p key={index}><strong>{role}:</strong> <div className="dark:text-white">{content}</div></p>;
      });

    // Combine all the React components
    const reactContent = [gptContent, initialContent, ...formattedContent];

    return <>{reactContent}</>;
  }

  return null;
};

export default JsonRenderer;