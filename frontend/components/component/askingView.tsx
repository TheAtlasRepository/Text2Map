import 'mapbox-gl/dist/mapbox-gl.css';
import { Button, } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "../ui/scroll-area";
import MapComponent from "./mapComponent";
import JsonRenderer from "../functions/JsonRenderer";
import ReactDOMServer from 'react-dom/server';
import { handleSaveChat, handleSendChat } from '../functions/ApiUtils';
import { Bbl } from '../ui/bbl';
import { InputDisplay } from './inputDisplay';

export default function AskingView({ onEditSave, editedText, setGeoJsonPath, setMarkersToolbar }: { onEditSave: (text: string) => void, editedText: string, setGeoJsonPath: (path: string) => void, setMarkersToolbar: (markers: { latitude: number; longitude: number; type: string; }[]) => void }) {
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState(false);
  const [localEditedText, setLocalEditedText] = useState('');
  const [jsonData, setJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [markers, setMarkers] = useState<{ latitude: number; longitude: number; type: string; }[]>([]);
  const [centerCoordinates, setCenterCoordinates] = useState<[number, number] | null>(null);

  const isInitialRender = useRef(true);
  const prevEditedTextRef = useRef<string | undefined>('');


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

  // Save the text to the backend
  useEffect(() => {
    if (!isInitialRender.current) { return; }
    // Set state so call is made only once if run in local dev outside docker
    isInitialRender.current = false;

    handleSaveChat(editedText, setEditingText, setCenterCoordinates, setLoading, setJsonData, setMarkers, setLocalEditedText, prevEditedTextRef);
    console.log("Text sendt to backend!");
  }, [editedText]);

  // Handle the case where the user clicks the "Edit & add text" button
  const handleEditClick = () => {
    setEditingText(true);
  };

  // Save the text to the backend
  const handleSaveTextWrapper = () => {
    handleSaveChat(localEditedText, setEditingText, setCenterCoordinates, setLoading, setJsonData, setMarkers, setLocalEditedText, prevEditedTextRef);
  };

  // Send the text to the backend
  const handleSendTextWrapper = () => {
    if (typeof inputText === 'string' && inputText.trim() !== "") {
      handleSendChat(inputText, setJsonData, setCenterCoordinates, setMarkers, setInputText, setLoading);
      // Set the inputText to an empty string after sending the request
      setInputText("");
    } else {
      // Handle case where inputText is not a string or is empty
      console.log('Input text is not a string or is empty. Not sending the request.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 dark:text-white overflow-y-auto">
      <div className="flex">
         {/* <aside className="w-1/3 p-4 space-y-4 border-r flex flex-col" style={{ flex: '0 0 auto', height: 'calc(100vh - 57px)' }}>
          <div className="flex items-center justify-between w-full dark:text-white">
            {editingText ? (
              <Input
                name="EditField"
                type="text"
                value={localEditedText}
                onChange={(e) => setLocalEditedText(e.target.value)}
                className="p-2 text-lg font-semibold"
              />
            ) : (
              <h1 className="p-2 rounded text-2xl font-semibold">{localEditedText}</h1>
            )}
          </div>
          {editingText && (
            <div className="flex items-center justify-center space-x-2 mt-auto">
              <Button onClick={handleSaveTextWrapper} variant="secondary">
                Save
              </Button>
            </div>
          )}
          {!editingText && (
            <div className="flex justify-center space-x-2 mt-auto self-center0">
              <Button onClick={handleEditClick} variant="secondary" className="flex items-center justify-center space-x-2" >
                <span>Edit & add text</span>
              </Button>
            </div>
          )}
          <ScrollArea>
            <div className="dark:text-white">
              {loading ? (
                <Bbl />
              ) : (
                <div>
                  <JsonRenderer jsonData={jsonData} />
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-center space-x-2 mt-auto">
            <Input
              name="ChatInput"
              placeholder="Type your message here..."
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <Button className="dark:bg-gray-300 dark:hover:bg-gray-500" onClick={handleSendTextWrapper} disabled={inputText?.trim() === ""}>
              Send
            </Button>
          </div>
        </aside> */}

        <InputDisplay
          displayState={1} // For manual text-input
          input={localEditedText}
          jsonData={jsonData}
          markers={markers}
        />
        <main className="flex-auto relative w-2/3">
          <div style={{ height: 'calc(100vh - 57px)' }}>
            <MapComponent
              markers={markers}
              centerCoordinates={centerCoordinates}
              selectedMarkerIndex={selectedMarkerIndex}
              setSelectedMarkerIndex={setSelectedMarkerIndex}
              geojsonData={jsonData?.selected_countries_geojson_path}
            />
          </div>
        </main>
      </div>
    </div>
  )
}