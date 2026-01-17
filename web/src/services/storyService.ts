import { GameStateResponse } from "../shared/types/types";

// Nutze Umgebungsvariablen für die URL, Fallback für lokale Entwicklung
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/story";

export async function startGame(scenario: string): Promise<GameStateResponse> {
  console.log('i get triggered')
  const res = await fetch(`${API_URL}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenario }),
  });
  
  if (!res.ok) {
    throw new Error(`Fehler beim Starten des Spiels: ${res.statusText}`);
  }
  
  return res.json();
}

export async function playTurn(sessionId: string, fate: string): Promise<GameStateResponse> {
  const res = await fetch(`${API_URL}/turn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, fate_intervention: fate }),
  });

  if (!res.ok) {
    throw new Error(`Fehler beim Verarbeiten des Spielzugs: ${res.statusText}`);
  }
  
  return res.json();
}