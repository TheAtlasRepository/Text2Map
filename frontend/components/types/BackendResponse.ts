/**
 * Used for data recieved from backend.
 */
export type BackendResponse = {
  chat_history: JsonChatHistory[];
  entities: CoordinateEntity[];
  selected_countries_geojson_path: GeoJsonData;
  thread_id: string;
}

/**
 * Datatype for chat history contained in the response from backend
 */
export type JsonChatHistory = {
  sender: string;
  message: string | {
    Information: string;
    locations: [];
  };
}

/**
 * Datatype for coordinate entities contained in the response from backend
 */
export type CoordinateEntity = {
  display_name: string;
  img_url: string;
  lat: number;
  lon: number;
}

/**
 * Datatype for geojson data contained in the response from backend
 */
export type GeoJsonData = {
  type: string;
  features: object[];
}
