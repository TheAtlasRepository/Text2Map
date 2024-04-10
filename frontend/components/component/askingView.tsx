import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useEffect, useRef } from "react";
import MapComponent from "./mapComponent";
import { handleSendChatRequest, handleAddRequestToChat } from '../functions/ApiUtils';
import { InputDisplay } from './inputDisplay';
import { MapMarker } from '../types/MapMarker';

export default function AskingView({
  inputText,
  onSaveEditText,
  setGeoJsonPath,
  setMarkersToolbar
}: {
  inputText: string,
  onSaveEditText: (text: string) => void,
  setGeoJsonPath: React.Dispatch<React.SetStateAction<string | null>>,
  setMarkersToolbar: React.Dispatch<React.SetStateAction<MapMarker[]>>
}) {
  const [loading, setLoading] = useState(true);
  const [jsonData, setJsonData] = useState<any>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const isInitialRender = useRef(true);

  // Ask user if he wants to reload the page
  useEffect(() => {
    window.onbeforeunload = () => true;
    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  // SetMarkersToolbar when markers change
  useEffect(() => {
    setMarkersToolbar(markers);
  }, [markers]);

  // Set the geoJsonPath when jsonData.selected_countries_geojson_path changes
  useEffect(() => {
    if (jsonData?.selected_countries_geojson_path) {
      setGeoJsonPath(jsonData.selected_countries_geojson_path);
    }
  }, [jsonData?.selected_countries_geojson_path]);

  // Send the request to the backend
  useEffect(() => {
    // If this is commented out, the effect runs more than once
    if (!isInitialRender.current) { return; }
    // Set state so call is made only once if run in local dev outside docker
    isInitialRender.current = false;

    handleSendChatRequest(inputText, setJsonData, setMarkers, setLoading);
  }, [inputText]);

  const handleSaveEditText = (editText: string) => {
    onSaveEditText(editText); // Pass value upwards
    
    // Ensure request is resendt
    handleSendChatRequest(editText, setJsonData, setMarkers, setLoading);
  }

  // Handler for sending additional chat requests to the backend
  const handleSendTextWrapper = (request: string) => {
    if (request.trim() === "") {
      // Handle case where inputText is not a string or is empty
      console.log('Input text is not a string or is empty. Not sending the request.');
      return;
    }

    // If all is good, send call to handler
    handleAddRequestToChat(request, setJsonData, setMarkers, setLoading);
  };

  const handleSetMarkers = (markers: MapMarker[]) => {
    setMarkers(markers);
  }

  return (
    <div className="bg-white dark:bg-gray-800 dark:text-white overflow-y-auto">
      <div className="flex">
        <InputDisplay
          displayState={1} // 1 for chat-input
          loading={loading}
          input={inputText}
          jsonData={jsonData}
          markers={markers}
          onSetMarkers={handleSetMarkers}
          onSaveEditText={handleSaveEditText}
          onSendRequest={handleSendTextWrapper}
        />
        <main className="flex-auto relative w-2/3">
          <div style={{ height: 'calc(100vh - 57px)' }}>
            <MapComponent
              markers={markers}
              geojsonData={jsonData?.selected_countries_geojson_path}
            />
          </div>
        </main>
      </div>
    </div>
  )
}