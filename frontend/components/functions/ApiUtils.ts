import { extractCoordinates } from '../functions/CoordinateExtractor'; // Adjust the import path
import axios from 'axios';
import { MapMarker } from '../types/MapMarker';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// If ran locally, use the following URL
//const BASE_URL = 'http://localhost:8000';

export const handleDataFetching = async (
  url: string,
  payload: any,
  setJsonData: React.Dispatch<React.SetStateAction<any>>,
  setMarkers: React.Dispatch<React.SetStateAction<MapMarker[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  additionalLogic?: (data: any) => void
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

    // If a GeoJSON path is provided, fetch the GeoJSON data
    if (data.selected_countries_geojson_path) {
      const geoJsonData = data.selected_countries_geojson_path;

      // Now you have the GeoJSON data
      console.log('GeoJSON data:', geoJsonData);

      // Filter out unnecessary strings and extract to coordinates. 
      const coordinates: MapMarker[] = extractCoordinates(data.entities
        .map((entry: any) => entry
          .filter((item: any) => Array
            .isArray(item) && item.length === 2))
        .flat()
      );
      console.log('Extracted Coordinates:', coordinates);

      // Proceed with the rest of your logic, e.g., extracting coordinates, setting markers, etc.

      setJsonData(data);
      setMarkers(coordinates);

      if (additionalLogic) {
        additionalLogic(data);
      }

      setLoading(false);
    } else {
      // Handle the case where no GeoJSON path is provided in the backend response
      console.error('No GeoJSON path provided in the backend response.');

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
  if (inputText.trim() !== '') {
    const responseData = await handleDataFetching(
      `${BASE_URL}/newChat?message=${inputText}`,
      { editedText: inputText },
      setJsonData,
      setMarkers,
      setLoading,
    );

    console.log('Response data:', responseData);

    const threadId = responseData.thread_id;
    if (!threadId) {
      console.error('No threadId provided in the backend response.');
      return;
    } else {
      document.cookie = `threadId=${threadId}; path=/; max-age=31536000`;
      console.log('threadId:', threadId);
    }
  }
};


export const handleAddRequestToChat = async (
  inputText: string,
  setJsonData: React.Dispatch<React.SetStateAction<any>>,
  setMarkers: React.Dispatch<React.SetStateAction<MapMarker[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (inputText.trim() !== '') {
    // Get all cookies and split them by semicolon. Find the first row starting with desired cookie-name, then ceep only value after equals-sign.
    let thread_id = document.cookie.split('; ').find((row) => row.startsWith('threadId='))?.split('=')[1];

    await handleDataFetching(
      `${BASE_URL}/moreChat?message=${inputText}&thread_id=${thread_id}`,
      { inputText },
      setJsonData,
      setMarkers,
      setLoading,
    );
  } else {
    // Handle case where inputText is empty
    console.log('Input text is empty. Not sending the request.');
  }
};

export const handleSendTextInput = async (
  inputText: string,
  setJsonData: React.Dispatch<React.SetStateAction<any>>,
  setMarkers: React.Dispatch<React.SetStateAction<MapMarker[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (inputText.trim() !== '') {
    await handleDataFetching(
      `${BASE_URL}/newText?text=${inputText}`,
      { inputText },
      setJsonData,
      setMarkers,
      setLoading
    );
  } else {
    // Handle case where inputText is empty
    console.log('Input text is empty. Not sending the request.');
  }
};
