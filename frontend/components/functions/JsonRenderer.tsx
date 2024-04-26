import React from 'react';
import { CoordinateEntity, JsonChatHistory } from '../types/BackendResponse';
import { MapMarker } from '../types/MapMarker';
import { Button } from '../ui/button';

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
          <Button
            key={index_h}
            variant="blue"
            style={{ width: '100%'}} 
            onClick={() => handleMarkerSelect(marker.display_name)}
          >
            {marker.display_name}
          </Button>
        );

        const numColumns = locations && locations.length > 5 ? 2 : 1;

        locations = (
          <div className={`grid grid-cols-${numColumns} gap-2 pt-3`}>
            {locations}
          </div>
        );

        historyIndex++;
      } else if (typeof message_value == 'string') {
        message = message_value;
      }
      
      return (
        <div key={index} className="pb-3">
          <p><strong>{role}:</strong> {message}</p>
          {locations}
        </div>
      );
    }).reverse();

    return <>{...formattedContent}</>;
  }

  return errorMessage;
};

export default JsonRenderer;