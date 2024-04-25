export type BackendResponse = {
  chat_history: JsonChatHistory[],
  entities: CoordinateEntity[],
  selected_countries_geojson_path: GeoJsonData,
  thread_id: string
}

type Location = {
  country: string;
  state: string;
  city: string;
  place: string;
  lat: number;
  lon: number;
};

type Message = {
  Information: string;
  locations: Location[];
} | string;

export type JsonChatHistory = {
  sender: string;
  message: Message;
}

export type CoordinateEntity = {
  lat: number;
  lon: number;
  display_name: string;
}

export type GeoJsonData = {
  type: string,
  features: object[]
}