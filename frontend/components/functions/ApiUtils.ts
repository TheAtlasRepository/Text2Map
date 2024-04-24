import axios from 'axios';
import { MapMarker } from '../types/MapMarker';
import { entitiesConvertor } from './EntitiesConvertor';
import { CoordinateEntity } from '../types/CoordinateEntity';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;



export const handleDataFetching = async (
  url: string,
  payload: any,
  setJsonData: React.Dispatch<React.SetStateAction<any>>,
  setMarkers: React.Dispatch<React.SetStateAction<MapMarker[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setLoading(true);

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;
    setJsonData(data);

    console.log('JSON data from the backend:', data);

    // If a GeoJSON and entitiy path is provided, fetch the GeoJSON data
    if (data.selected_countries_geojson_path && data.entities) {

      // Print out geoJsonData
      console.log('GeoJSON data:', data.selected_countries_geojson_path);      
      
      // Sort the order of locations returned.
      const data_entities: CoordinateEntity[] = data.entities;
      data_entities.sort((a, b) => {
        if (a.display_name < b.display_name) { return -1; }
        if (a.display_name < b.display_name) { return 1; }
        return 0;
      })
      const coordinates: MapMarker[] = entitiesConvertor(data_entities);

      // Print out locations
      console.log('Extracted Coordinates:', coordinates);
      setMarkers(coordinates);

      setLoading(false);
    } else {
      // Handle the case where no GeoJSON path is provided in the backend response
      console.error('No Entity or GeoJSON path provided in the backend response.');

      // Set loading to false
      setLoading(false);
    }
    return data;
  }
  catch (error) {
    console.error('Error fetching JSON data:', error);

    setLoading(false);
  }
};

export const handleSendChatRequest = async (
  inputText: string,
  setJsonData: React.Dispatch<React.SetStateAction<any>>,
  setMarkers: React.Dispatch<React.SetStateAction<MapMarker[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (inputText.trim() == '') { console.log('Input text is empty. Not sending the request.'); }

  const responseData = await handleDataFetching(
    `${BASE_URL}/newChat?message=${inputText}`,
    { editedText: inputText },
    setJsonData,
    setMarkers,
    setLoading,
  );
  if (!responseData) {
    console.error("Response came back empty");
    return
  }

  const threadId = responseData.thread_id;
  if (!threadId) {
    console.error('No threadId provided in the backend response.');
    return;
  } else {
    document.cookie = `threadId=${threadId}; path=/; max-age=31536000`;
    console.log('threadId:', threadId);
  }
};


export const handleAddRequestToChat = async (
  inputText: string,
  setJsonData: React.Dispatch<React.SetStateAction<any>>,
  setMarkers: React.Dispatch<React.SetStateAction<MapMarker[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (inputText.trim() == '') { console.log('Input text is empty. Not sending the request.'); }

  // Get all cookies and split them by semicolon. Find the first row starting with desired cookie-name, then ceep only value after equals-sign.
  let thread_id = document.cookie.split('; ').find((row) => row.startsWith('threadId='))?.split('=')[1];

  const responseData = await handleDataFetching(
    `${BASE_URL}/moreChat?message=${inputText}&thread_id=${thread_id}`,
    { inputText },
    setJsonData,
    setMarkers,
    setLoading,
  );

  if (!responseData) {
    console.error("Response came back empty");
    return
  }
};

export const handleSendTextInput = async (
  inputText: string,
  setJsonData: React.Dispatch<React.SetStateAction<any>>,
  setMarkers: React.Dispatch<React.SetStateAction<MapMarker[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (inputText.trim() !== '') { console.log('Input text is empty. Not sending the request.'); }

  const responseData = await handleDataFetching(
    `${BASE_URL}/newText?text=${inputText}`,
    { inputText },
    setJsonData,
    setMarkers,
    setLoading
  );

  if (!responseData) {
    console.error("Response came back empty");
    return
  }
};
