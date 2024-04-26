import axios from 'axios';
import { MapMarker } from '../types/MapMarker';
import { entitiesConvertor } from './EntitiesConvertor';
import { BackendResponse, CoordinateEntity, GeoJsonData } from '../types/BackendResponse';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;



/**
 * Main handler for fetching data from backend.
 * @param url The url to call
 * @param payload The data to send allong with the url
 * @param setJsonData SetStateAction for storing JsonData 
 * @param setMarkers SetStateAction for storing MapMarkers
 * @param setLoading SetStateAction for controlling Load visuals
 * @param setMarkerHistoryList SetStateAction for storing new history
 * @param additionalGeoJsonData Optional for adding existing data with new
 * @param additionalMapMarkers Optional for adding existing data with new
 * @param markerHistoryList List of markerhistory
 * @returns 
 */
export const handleDataFetching = async (
  url: string,
  payload: any,
  setJsonData: React.Dispatch<React.SetStateAction<any>>,
  setMarkers: React.Dispatch<React.SetStateAction<MapMarker[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setMarkerHistoryList?: React.Dispatch<React.SetStateAction<CoordinateEntity[][]>>,
  additionalGeoJsonData?: GeoJsonData,
  additionalMapMarkers?: MapMarker[],
  markerHistoryList?: CoordinateEntity[][]
) => {
  setLoading(true);

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: BackendResponse = response.data;
    console.log('JSON data from the backend:', data);

    // If a GeoJSON and entitiy path is provided, fetch the GeoJSON data
    if (data.selected_countries_geojson_path && data.entities) {

      // If there is data to combine, concat the features and add to data
      if (additionalGeoJsonData) {
        const combined_features = data.selected_countries_geojson_path.features.concat(additionalGeoJsonData.features);
        data.selected_countries_geojson_path.features = combined_features;
      }


      // Adding entities to history
      if (markerHistoryList && setMarkerHistoryList) {
        markerHistoryList.unshift(data.entities);
        setMarkerHistoryList(markerHistoryList);
      } else if (setMarkerHistoryList) {
        const markerlist: CoordinateEntity[][] = [];
        markerlist.push(data.entities);
        setMarkerHistoryList(markerlist);
      }

      // Convert coordinates to MapMarkers, and combine with existing markers if present
      let coordinates: MapMarker[] = entitiesConvertor(data.entities, additionalMapMarkers);

      // Sort the coordinates alphabetically
      coordinates.sort((a, b) => {
        if (a.display_name < b.display_name) { return -1; }
        if (a.display_name < b.display_name) { return 1; }
        return 0;
      })

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

    setJsonData(data);
    return data;
  }
  catch (error) {
    console.error('Error fetching JSON data:', error);

    setLoading(false);
  }
};

/**
 * Handler for starting chats with GPT in backend and retreaving locations from answers.
 * @param inputText The text to start a chat with
 * @param setJsonData SetStateAction for storing JsonData 
 * @param setMarkers SetStateAction for storing MapMarkers
 * @param setLoading SetStateAction for controlling Load visuals
 * @param setMarkerHistoryList SetStateAction for storing new history
 * @returns Void - Just for ending loops
 */
export const handleSendChatRequest = async (
  inputText: string,
  setJsonData: React.Dispatch<React.SetStateAction<any>>,
  setMarkers: React.Dispatch<React.SetStateAction<MapMarker[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setMarkerHistoryList: React.Dispatch<React.SetStateAction<CoordinateEntity[][]>>,
) => {
  if (inputText.trim() == '') { console.log('Input text is empty. Not sending the request.'); }

  const responseData = await handleDataFetching(
    `${BASE_URL}/newChat?message=${inputText}`,
    { editedText: inputText },
    setJsonData,
    setMarkers,
    setLoading,
    setMarkerHistoryList,
  );
  if (!responseData) {
    console.error("Response came back empty");
    return;
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


/**
 * Handler for adding additional requests to an ongoing chat
 * @param inputText The text to add to chat
 * @param setJsonData SetStateAction for storing JsonData 
 * @param setMarkers SetStateAction for storing MapMarkers
 * @param setLoading SetStateAction for controlling Load visuals
 * @param setMarkerHistoryList SetStateAction for storing new history
 * @param geoJsonData Existing data to hold onto
 * @param mapMarkers Existing data to hold onto
 * @param markerHistoryList List of markerhistory
 */
export const handleAddRequestToChat = async (
  inputText: string,
  setJsonData: React.Dispatch<React.SetStateAction<any>>,
  setMarkers: React.Dispatch<React.SetStateAction<MapMarker[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setMarkerHistoryList: React.Dispatch<React.SetStateAction<CoordinateEntity[][]>>,
  geoJsonData: GeoJsonData,
  mapMarkers: MapMarker[],
  markerHistoryList: CoordinateEntity[][]
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
    setMarkerHistoryList,
    geoJsonData,
    mapMarkers,
    markerHistoryList,
  );

  if (!responseData) {
    console.error("Response came back empty");
  }
};

/**
 * Handler for extracting locations out from text
 * @param inputText Text with locations to be mapped out
 * @param setJsonData SetStateAction for storing JsonData 
 * @param setMarkers SetStateAction for storing MapMarkers
 * @param setLoading SetStateAction for controlling Load visuals
 */
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
  }
};
