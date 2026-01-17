"""
Story Router für die Agentic Storyteller API.

Dieser Router definiert die HTTP-Endpoints für das interaktive Storytelling-Spiel.
Er verbindet die REST-API mit der GameEngine-Logik und kümmert sich um:
- Validierung der Requests (via Pydantic Schemas)
- Konvertierung von GameSession-Objekten zu API-Response-Modellen
- Fehlerbehandlung (z.B. Session nicht gefunden)

Endpoints:
    POST /story/start  - Neues Spiel mit Szenario starten
    POST /story/turn   - Eine Spielrunde mit optionaler Benutzereingabe verarbeiten
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import StartRequest, TurnRequest, GameStateResponse
from app.services.game_engine import GameManager

router = APIRouter(
    prefix="/story",
    tags=["Story"],
    responses={404: {"description": "Not found"}},
)


def build_response(game) -> GameStateResponse:
    """
    Konvertiert eine GameSession zu einem GameStateResponse für die REST-API.

    Diese Hilfsfunktion extrahiert die relevanten Daten aus der internen GameSession
    und formt sie in das erwartete Response-Schema um. Dies verhindert Wiederholungen
    in den verschiedenen Endpoints.

    Args:
        game: Die GameSession-Instanz aus der GameEngine.

    Returns:
        GameStateResponse: Das validierte Response-Schema mit allen UI-Daten.

    Details:
        - Narrative: Der letzte generierte Story-Text oder (am Start) die Plot-Summary
        - Active Actor: Der Name des Agenten, der diese Runde aktiv war
        - State Mapping: Location, Quest und Inventory werden aus game.state extrahiert
        - History: Die letzten 5 Narrative-Blöcke für Debug/History im Frontend
    """

    # Hole den neuesten Narrative-Text; fallback auf plot_summary falls History leer
    if game.narrative_history:
        narrative = game.narrative_history[-1]
    else:
        narrative = game.plot_summary

    # Bestimme den aktiven Agenten für diese Runde
    active_actor = next((a.name for a in game.agents if a.is_active), "Unbekannt")

    return GameStateResponse(
        session_id=game.session_id,
        turn_count=game.turn_count,
        last_narrative=narrative,
        image_url=game.last_image_url,
        # Agenten- und State-Daten für Frontend
        active_actor_name=active_actor,
        current_location=game.state.location,
        current_quest=game.state.current_quest,
        inventory=game.state.inventory,
        # History für Debug und Kontext
        history=game.narrative_history[-5:],
    )


@router.post("/start", response_model=GameStateResponse)
async def start_game_endpoint(request: StartRequest):
    """
    Startet ein neues Storytelling-Spiel.

    Dieser Endpoint initiiert eine neue GameSession basierend auf dem übergebenen Szenario.
    Die GameEngine generiert automatisch:
    - Charaktere/Agenten basierend auf dem Szenario
    - Das visuelle Style
    - Die Startposition

    Args:
        request (StartRequest): Enthält das Szenario/Thema der Geschichte.
                               Beispiel: "Ein Abenteuer in einer mystischen Wald-Stadt"

    Returns:
        GameStateResponse: Der Initialzustand des Spiels (Turn 0, erste Narrative, etc.)

    Raises:
        HTTPException (500): Falls die GameSession nicht erstellt werden konnte
                            (z.B. LLM Fehler, API nicht erreichbar).
    """
    game = GameManager.create_game(request.scenario)
    if not game:
        raise HTTPException(status_code=500, detail="Failed to create game")

    return build_response(game)


@router.post("/turn", response_model=GameStateResponse)
async def play_turn_endpoint(request: TurnRequest):
    """
    Verarbeitet eine Spielrunde und treibt die Geschichte voran.

    Dieser Endpoint führt die nächste GameSession-Runde aus:
    - Der nächste Agent führt eine Aktion aus
    - Optional wird eine Benutzereingabe (fate_intervention) berücksichtigt
    - Ein neuer Narrative-Text wird generiert
    - Ggf. wird ein DALL-E Bild für die Szene erstellt
    - Der Spielzustand wird aktualisiert (Location, Inventory, etc.)

    Args:
        request (TurnRequest):
            - session_id: Die ID der bestehenden GameSession
            - fate_intervention: Optionale Benutzereingabe ("Der Spieler öffnet die Tür")

    Returns:
        GameStateResponse: Der aktualisierte Spielzustand nach dieser Runde.

    Raises:
        HTTPException (404): Falls die Session ID nicht existiert oder ungültig ist.
    """
    game = GameManager.process_turn(request.session_id, request.fate_intervention)  # type: ignore

    if not game:
        raise HTTPException(status_code=404, detail="Game session not found")

    return build_response(game)
