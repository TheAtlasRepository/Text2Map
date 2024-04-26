import React from 'react';
import { CoordinateEntity, JsonChatHistory } from '../types/BackendResponse';
import { MapMarker } from '../types/MapMarker';

type JsonRendererProps = {
  jsonChatHistory: JsonChatHistory[]; // Replace 'any' with the actual type of your jsonData
  onSelectClick: (marker: MapMarker) => void;
  markerHistory: CoordinateEntity[][];
  mapMarkers: MapMarker[];

};

const errorMessage = (
  <div className="border rounded-lg border-red-500 p-3 text-red-500">
    No text was found.
  </div>
)

/**
 * Renders the respons retrieved from backend
 * @param jsonChatHistory The chat history from the backend 
 * @param onSelectClick Event for when a marker is selected
 * @param markerHistory A historylist of markers retrieved from backend
 * @param mapMarkers A list of markers
 * @returns A collection of paragraphs displaying the chat history
 */
const JsonRenderer: React.FC<JsonRendererProps> = ({ jsonChatHistory, onSelectClick, markerHistory, mapMarkers }) => {

  if (!jsonChatHistory) {
    return errorMessage;
  }

  const handleMarkerSelect = (name: string) => {
    const mapMarker = mapMarkers.find(mark => mark.display_name == name);
    if (mapMarker)
      onSelectClick(mapMarker);
  }


  if (Array.isArray(jsonChatHistory) && jsonChatHistory.length > 0) {
    let historyIndex = 0;
    const formattedContent = jsonChatHistory.map((item, index) => {
      const role = item.sender === 'user' ? 'User' : 'Assistant';
      const message_value = item.message;
      let message = "";
      let locations = null;


      // Determine if the message is a string or an object
      if (typeof message_value == "object") {
        message = message_value.Information;

        // Directly use mapMarker to create buttons
        locations = markerHistory[historyIndex].map((marker, index_h) =>
          <button
            key={index_h}
            className="w-full bg-blue-500 hover:bg-blue-600 rounded-md"
            onClick={() => handleMarkerSelect(marker.display_name)}
          >
            {marker.display_name}
          </button>
        );
        historyIndex++;
      } else if (typeof message_value == 'string') {
        message = message_value;
      }

      return (
        <div key={index} className="pb-3">
          <p><strong>{role}:</strong> {message}</p>
          {locations && <p>{locations}</p>}
        </div>
      );
    }).reverse();

    return <>{...formattedContent}</>;
  }

  return errorMessage;
};

export default JsonRenderer;