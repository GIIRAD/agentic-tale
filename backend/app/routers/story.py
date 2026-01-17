from fastapi import APIRouter, HTTPException
from app.models.schemas import StartRequest, TurnRequest, GameStateResponse
from app.services.game_engine import GameManager

router = APIRouter(
    prefix="/story",
    tags=["Story"],
    responses={404: {"description": "Not found"}},
)

# Hilfsfunktion, um Wiederholungen zu vermeiden
def build_response(game) -> GameStateResponse:
    # Wir holen den letzten Textblock. Wenn noch keiner da ist (Start), nehmen wir die Summary.
    if game.narrative_history:
        narrative = game.narrative_history[-1]
    else:
        narrative = game.plot_summary

    # Wir müssen herausfinden, wer als nächstes dran ist (oder wer gerade gehandelt hat)
    # Da process_turn rotiert, nehmen wir den aktuellen aktiven Agenten aus der Liste
    # (Hier vereinfacht: Wir nehmen den ersten 'active' Agent als Stellvertreter für die Gruppe)
    active_actor = next((a.name for a in game.agents if a.is_active), "Unbekannt")

    return GameStateResponse(
        session_id=game.session_id,
        turn_count=game.turn_count,
        last_narrative=narrative,
        image_url=game.last_image_url,
        
        # NEU: Mapping der Objekteigenschaften auf das Pydantic Model
        active_actor_name=active_actor,
        current_location=game.state.location,      # Zugriff auf das State Objekt
        current_quest=game.state.current_quest,    # Zugriff auf das State Objekt
        inventory=game.state.inventory,            # Zugriff auf das State Objekt
        
        history=game.narrative_history[-5:]        # Die letzten 5 Absätze für den Client
    )

@router.post("/start", response_model=GameStateResponse)
async def start_game_endpoint(request: StartRequest):
    game = GameManager.create_game(request.scenario)
    if not game:
        raise HTTPException(status_code=500, detail="Failed to create game")
    
    return build_response(game)

@router.post("/turn", response_model=GameStateResponse)
async def play_turn_endpoint(request: TurnRequest):
    # Achtung: process_turn kann None zurückgeben, wenn ID falsch ist
    game = GameManager.process_turn(request.session_id, request.fate_intervention)

    if not game:
        raise HTTPException(status_code=404, detail="Game session not found")

    return build_response(game)