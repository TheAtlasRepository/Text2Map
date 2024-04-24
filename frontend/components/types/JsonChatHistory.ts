export type JsonChatHistory = {
  sender: string;
  message: string | {
    Information: string;
    locations: []
  };
}