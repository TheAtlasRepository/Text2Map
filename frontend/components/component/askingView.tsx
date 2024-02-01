import Map, { Marker, NavigationControl, GeolocateControl, Popup} from "react-map-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button, } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef, ReactNode } from "react";
import { ScrollArea } from "../ui/scroll-area";
import ReactMarkdown from "react-markdown";
import InfoPanel from "./info-panel";

export default function AskingView({ onEditSave, editedText }: { onEditSave: (text: string) => void, editedText: string }) {

    type Coordinate = {
      latitude: number;
      longitude: number;
      type: string;
    };

    const mapRef = useRef(null);
    const [selectedMarkerPixelCoordinates, setSelectedMarkerPixelCoordinates] = useState<{ top: number; left: number } | null>(null);
    const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number | null>(null);
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    const [editingText, setEditingText] = useState(false);  
    const [localEditedText, setLocalEditedText] = useState('');
    const [jsonData, setJsonData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [inputText, setInputText] = useState('');
    const [markers, setMarkers] = useState<{ latitude: number; longitude: number; type: string }[]>([]);
    const [centerCoordinates, setCenterCoordinates] = useState<[number, number] | null>(null);
    const [initialViewState, setInitialViewState] = useState<any>({
      latitude: 35.668641,
      longitude: 139.750567,
      zoom: 1,
    });

    const isInitialRender = useRef(true);
    const prevEditedTextRef = useRef<string | undefined>();

    useEffect(() => {
      if (centerCoordinates) {
        setInitialViewState({
          latitude: centerCoordinates[1],
          longitude: centerCoordinates[0],
          zoom: 10,  // Adjust the zoom level as needed
        });
      }
    }, [centerCoordinates]);

    useEffect(() => {
      if (isInitialRender.current) {
        isInitialRender.current = false;
        return;
      }
  
      // Rest of your useEffect logic...
      console.log('useEffect running. editedText:', editedText);
  
      if (editedText !== prevEditedTextRef.current) {
        // Fetch JSON data from your backend API
        fetch('http://127.0.0.1:8000/sendchat?message='+ 'You are a helpful GIS expert and History major. You will answer the given prompts in a short (500 words max) but informative way. Format your response to be easy to read. Here is what you will answer: ' + editedText, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ editedText: editedText }),
        })
          .then(response => response.json())
          .then(data => {
            console.log('JSON data from the backend:', data);

            // Extract entities and filter out unnecessary strings
            const filteredEntities = data.entities
              .map((entry:any) => entry.filter((item:any) => Array.isArray(item) && item.length === 2))
              .flat();

            console.log('Filtered Entities:', filteredEntities);

            const coordinates: Coordinate[] = extractCoordinates(filteredEntities);
            console.log('Extracted Coordinates:', coordinates);
            
            // place the markers on the map
            const coordinatesArray = coordinates.map((coordinate) => [coordinate.longitude, coordinate.latitude]);
            console.log('Coordinates Array:', coordinatesArray);

            // Calculate the center coordinates
            const centerCoordinates = coordinatesArray.reduce(
              (accumulator, currentValue) => {
                return [
                  accumulator[0] + currentValue[0],
                  accumulator[1] + currentValue[1],
                ];
              },
              [0, 0]
            );
            console.log('Center Coordinates:', centerCoordinates);

            setJsonData(data);
            setMarkers(coordinates as { latitude: number; longitude: number; type: string }[]);
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
      if (localEditedText !== prevEditedTextRef.current) {
        setEditingText(false);
        setLoading(true);
        // First, reset the chat history
        fetch('http://127.0.0.1:8000/resetchat?message='+ 'You are a helpful GIS expert and History major. You will answer the given prompts in a short (500 words max) but informative way. Format your response to be easy to read. Here is what you will answer: ' + localEditedText, {
          method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
          console.log('JSON data from the backend:', data);
          // Extract entities and filter out unnecessary strings
          const filteredEntities = data.entities
          .map((entry:any) => entry.filter((item:any) => Array.isArray(item) && item.length === 2))
          .flat();

          console.log('Filtered Entities:', filteredEntities);

          const coordinates: Coordinate[] = extractCoordinates(filteredEntities);
          console.log('Extracted Coordinates:', coordinates);
          
          // place the markers on the map
          const coordinatesArray = coordinates.map((coordinate) => [coordinate.longitude, coordinate.latitude]);
          console.log('Coordinates Array:', coordinatesArray);

          // Calculate the center coordinates
          const centerCoordinates = coordinatesArray.reduce(
            (accumulator, currentValue) => {
              return [
                accumulator[0] + currentValue[0],
                accumulator[1] + currentValue[1],
              ];
            },
            [0, 0]
          );
          console.log('Center Coordinates:', centerCoordinates);

          setJsonData(data);
          setMarkers(coordinates as { latitude: number; longitude: number; type: string }[]);
          setLoading(false);
          setLocalEditedText(editedText);
        })
        .catch(error => {
          console.error('Error fetching JSON data:', error);
          setLocalEditedText(localEditedText);
          setLoading(false);
        });
      }
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

            // Extract entities and filter out unnecessary strings
            const filteredEntities = data.entities
            .map((entry:any) => entry.filter((item:any) => Array.isArray(item) && item.length === 2))
            .flat();

            console.log('Filtered Entities:', filteredEntities);

            const coordinates: Coordinate[] = extractCoordinates(filteredEntities);
            console.log('Extracted Coordinates:', coordinates);
            
            // place the markers on the map
            const coordinatesArray = coordinates.map((coordinate) => [coordinate.longitude, coordinate.latitude]);
            console.log('Coordinates Array:', coordinatesArray);

            // Calculate the center coordinates
            const centerCoordinates = coordinatesArray.reduce(
              (accumulator, currentValue) => {
                return [
                  accumulator[0] + currentValue[0],
                  accumulator[1] + currentValue[1],
                ];
              },
              [0, 0]
            );
            console.log('Center Coordinates:', centerCoordinates);

            setJsonData(data);
            setMarkers(coordinates as { latitude: number; longitude: number; type: string }[]);
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

    const extractCoordinates = (filteredEntities: [string, any][]): Coordinate[] => {
      const coordinates: Coordinate[] = [];
      let currentEntity: Coordinate | null = null;
    
      filteredEntities.forEach(([type, value]: [string, any]) => {
        if (type.startsWith('Found entities:')) {
          // If it's a new entity, create a new object to store its information
          currentEntity = { type: value, latitude: 0, longitude: 0 };
          coordinates.push(currentEntity);
        } else if (type === 'Latitude:') {
          // If it's latitude, assign the value to the current entity
          if (currentEntity) currentEntity.latitude = parseFloat(value);
        } else if (type === 'Longitude:') {
          // If it's longitude, assign the value to the current entity
          if (currentEntity) currentEntity.longitude = parseFloat(value);
        }
      });
    
      return coordinates;
    };    

    const renderJsonData = (): string => {
      if (jsonData) {
        const gptContent = jsonData.GPT ? `<p><strong>GPT:</strong> ${jsonData.GPT}</p>` : '';
        const chatHistory = jsonData.chat_history;

        if (Array.isArray(chatHistory) && chatHistory.length > 0) {
          const initialContent = chatHistory[0].content || '';
          const formattedContent = chatHistory.slice(1).map((item, index) => {
            const role = item.role === 'user' ? 'User' : 'Assistant';
            const content = typeof item.content === 'object' ? item.content.content : item.content;
            return `<p><strong>${role}:</strong> ${content}</p>`;
          }).join('');

          // Combine all the HTML content
          const htmlContent = `${gptContent} ${initialContent}${formattedContent}`;

          // Use dangerouslySetInnerHTML to directly render HTML content
          return htmlContent;
        }
      }

      return '';
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
              <div className="justify-center">Thinking...</div>
            ) : (
              <ReactMarkdown className="prose" children={renderJsonData()} /> // Use ReactMarkdown to
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
              ref={mapRef}
            >
              <GeolocateControl position="bottom-right" />
              <NavigationControl position="bottom-right" />

              {/* Render markers */}
              {markers.map((marker, index) => (
                <Marker
                  key={index}
                  latitude={marker.latitude}
                  longitude={marker.longitude}
                >
                  <div
                    className={`custom-marker custom-marker-${index}`}
                    onClick={() => {
                      setSelectedMarkerIndex((prevIndex) => (prevIndex === index ? null : index));
                    }}
                  >
                    <span>{marker.type}</span>
                    {selectedMarkerIndex === index && (
                      <Popup
                        latitude={marker.latitude}
                        longitude={marker.longitude}
                        closeButton={false}
                        closeOnClick={false}
                        onClose={() => setSelectedMarkerIndex(null)}
                        className="custom-popup"
                        anchor="bottom"
                      >
                          <InfoPanel title={marker.type} />
                    </Popup>
                    )}
                  </div>
                </Marker>
              ))}
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