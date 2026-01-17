export interface GameStateResponse {
  session_id: string;
  turn_count: number;
  last_narrative: string;
  image_url: string | null;
  history: string[];
  current_actor: string;
}

export interface PageData {
  text: string;
  imageUrl: string | null;
  turn: number;
}