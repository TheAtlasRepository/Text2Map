export type BackendResponse = {
  chat_history: JsonChatHistory[];
  entities: CoordinateEntity[];
  selected_countries_geojson_path: GeoJsonData;
  thread_id: string;
}

export type JsonChatHistory = {
  sender: string;
  message: string | {
    Information: string;
    locations: [];
  };
}

export type CoordinateEntity = {
  display_name: string;
  img_url: string;
  lat: number;
  lon: number;
}

export type GeoJsonData = {
  type: string;
  features: object[];
}
