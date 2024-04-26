import React, { useState, useEffect } from 'react';
import { CoordinateEntity, JsonChatHistory} from '../types/BackendResponse';
import { MapMarker } from '../types/MapMarker';
import { Button, } from "@/components/ui/button";

type JsonRendererProps = {
  jsonChatHistory: JsonChatHistory[]; // Replace 'any' with the actual type of your jsonData
  setSelectedMarker: React.Dispatch<React.SetStateAction<MapMarker | null>>,
  mapMarker : MapMarker[];
  coordinates: any;
  
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
const JsonRenderer: React.FC<JsonRendererProps> = ({ jsonChatHistory, coordinates, setSelectedMarker, mapMarker }) => {

  if (!jsonChatHistory) {
    return errorMessage;
  }

  console.log('Chat history:', jsonChatHistory);

  if (Array.isArray(jsonChatHistory) && jsonChatHistory.length > 0) {
    const formattedContent = jsonChatHistory.map((item, index) => {
      const role = item.sender === 'user' ? 'User' : 'Assistant';
      const message_value = item.message;
      let message = "";
      let locations = null;

      // Determine if the message is a string or an object
      if (typeof message_value == "object") {
        message = message_value.Information;
        // Remove duplicates from mapMarker
        mapMarker = mapMarker.filter((marker, index, self) =>
          index === self.findIndex((t) => (
            t.latitude === marker.latitude && t.longitude === marker.longitude
          ))
        );

        // Directly use mapMarker to create buttons
        locations = mapMarker.map((marker, index) => 
          <ul key={index}>
            <li>
              <Button 
                variant="blue" 
                style={{ margin: '5px', width: '100%'}} 
                onClick={() => setSelectedMarker(marker)}
              >
                {marker.display_name}
              </Button>
            </li>
          </ul>
        );
      } else if (typeof message_value == 'string') {
        message = message_value;
      }

      return (
        <div key={index} className="pb-3">
          <p><strong>{role}:</strong> {message}</p>
          {locations && <p style={{ margin: '10px' }}><strong>Locations:</strong>{locations}</p>}
        </div>
      );
    }).reverse();

    return <>{...formattedContent}</>;
  }

  return errorMessage;
};

export default React.memo(JsonRenderer);