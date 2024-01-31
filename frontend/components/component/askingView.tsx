import Map, { NavigationControl, GeolocateControl } from "react-map-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button, } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "../ui/scroll-area";

export default function AskingView({ onEditSave, editedText }: { onEditSave: (text: string) => void, editedText: string }) {

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    const [editingText, setEditingText] = useState(false);  
    const [localEditedText, setLocalEditedText] = useState('');
    const [jsonData, setJsonData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [inputText, setInputText] = useState('');
    const [entities, setEntities] = useState<any>({});
    const [centerCoordinates, setCenterCoordinates] = useState<[number, number] | null>(null);
    const [initialViewState, setInitialViewState] = useState<any>({
      latitude: 35.668641,
      longitude: 139.750567,
      zoom: 1,
    });

    const isInitialRender = useRef(true);
    const prevEditedTextRef = useRef<string | undefined>();

    useEffect(() => {
      if (isInitialRender.current) {
        isInitialRender.current = false;
        return;
      }
  
      // Rest of your useEffect logic...
      console.log('useEffect running. editedText:', editedText);
  
      if (editedText !== prevEditedTextRef.current) {
        // Fetch JSON data from your backend API
        fetch('http://127.0.0.1:8000/sendchat?message=' + editedText, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ editedText: editedText }),
        })
          .then(response => response.json())
          .then(data => {
            console.log('JSON data from the backend:', data);
            setJsonData(data);
            setLoading(false);
            setLocalEditedText(editedText);
          })
          .catch(error => {
            console.error('Error fetching JSON data:', error);
            setLocalEditedText(editedText);
            setLoading(false);
          });
      }
    }, [editedText]);

    useEffect(() => {
      // Update the initial view state when centerCoordinates change
      if (centerCoordinates) {
        setInitialViewState({
          latitude: centerCoordinates[1],
          longitude: centerCoordinates[0],
          zoom: 1,
        });
      }
    }, [centerCoordinates]);

    const handleEditClick = () => {
      setEditingText(true);
    };
  
    const handleSaveText = () => {
      console.log('handleSaveText called. editedText:', editedText);
      setLoading(true);
      fetch('http://127.0.0.1:8000/sendchat?message=' + editedText, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ editedText: editedText }),
      })
        .then(response => response.json())
        .then(data => {
          // only set the data to whats inside the GPT part of the json
          console.log('JSON data from the backend:', data);
          setJsonData(data);
        })
        .catch(error => {
          console.error('Error fetching JSON data:', error);
          setLocalEditedText(editedText);
          setLoading(false);
        });
    };

    // Send the edited text to the backend
    const handleSendText = async () => {
      if (inputText.trim() !== '') {
        setLoading(true);

        // Assuming inputText is the data you want to send to the backend
        fetch('http://127.0.0.1:8000/sendchat?message=' + inputText, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputText }), // Adjust the payload as needed
        })
          .then(response => response.json())
          .then(data => {
            console.log('Updated JSON data from the backend:', data);
            setJsonData(data);
            // set the input text to empty
            setInputText('');
            setLoading(false);
          })
          .catch(error => {
            console.error('Error sending or fetching JSON data:', error);
            setLoading(false);
          });
      } else {
        // Handle case where inputText is empty
        console.log('Input text is empty. Not sending the request.');
      }
    };

    const renderJsonData = () => {
      if (jsonData) {
        const gptContent = jsonData.GPT ? (
          <div key="gpt">
            <strong>GPT:</strong> {jsonData.GPT}
          </div>
        ) : null;
    
        const chatHistoryContent = jsonData.chat_history && jsonData.chat_history.length > 0 ? (
          <div key="chat_history">
            {renderArray(jsonData.chat_history)}
          </div>
        ) : null;
    
        return [gptContent, chatHistoryContent];
      }
    
      return null;
    };
    
    const renderArray = (array: any[]) => {
      return array.map((item, index) => (
        <div key={index}>
          <strong>{item.role === 'user' && 'User: '}</strong>
          <strong>{item.role === 'assistant' && 'Assistant: '}</strong>
          {typeof item.content === 'object' ? item.content.content : item.content}
        </div>
      ));
    };

    return (
      <div className="bg-white min-h-screen overflow-y-auto">
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold">Unsaved map</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost">Export map</Button>
            <Button variant="ghost">Share</Button>
            <Button variant="ghost">Embed</Button>
            <Button variant="secondary">Save map</Button>
          </div>
        </header>
        <div className="flex">
        <aside className="w-1/3 p-4 space-y-4 border-r flex flex-col" style={{ flex: '0 0 auto', height: 'calc(100vh - 73px)' }}>
            <div className="flex items-center justify-between w-full">
            {editingText ? (
            <input
            type="text"
            value={localEditedText}
            onChange={(e) => setLocalEditedText(e.target.value)}
            className="border border-gray-300 p-2 rounded text-lg font-semibold w-full"
          />
          ) : (
              <h1 className="p-2 rounded text-2xl font-semibold">{localEditedText}</h1>
          )}
            </div>
            {editingText && (
            <div className="flex items-center justify-center space-x-2 mt-auto">
              <Button onClick={handleSaveText} variant="secondary">
                Save
              </Button>
            </div>
          )}
          {!editingText && (
            <div className="flex justify-center space-x-2 mt-auto self-center">
              <Button onClick={handleEditClick} className="flex items-center justify-center space-x-2" variant="secondary">
                <FileEditIcon className="h-5 w-5" />
                <span>Edit & add text</span>
              </Button>
            </div>
          )}
          <ScrollArea>
            {loading ? (
              <div>Thinking...</div>
            ) : (
              <>
                {renderJsonData()}
              </>
            )}
          </ScrollArea>
          <div className="flex justify-center space-x-2 mt-auto">
            <Input
              placeholder="Type your message here..."
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <Button onClick={handleSendText} variant="secondary" disabled={inputText.trim() === ""}>
              Send
            </Button>
          </div>
          </aside>
          <main className="flex-auto relative w-2/3">
            <div style={{ height: 'calc(100vh - 73px)' }}>
            <Map
              mapboxAccessToken={mapboxToken}
              mapStyle="mapbox://styles/mapbox/standard"
              initialViewState={initialViewState}
              maxZoom={20}
              minZoom={3}
            >
              <GeolocateControl position="bottom-right" />
              <NavigationControl position="bottom-right" />
            </Map>
            </div>
          </main>
        </div>
      </div>
    )
  }

  
  
  function FileEditIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z" />
      </svg>
    )
  }