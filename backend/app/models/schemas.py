from pydantic import BaseModel
from typing import List, Optional


class StartRequest(BaseModel):
    scenario: str


class TurnRequest(BaseModel):
    session_id: str
    fate_intervention: Optional[str] = ""


class AgentData(BaseModel):
    name: str
    description: str


class GameStateResponse(BaseModel):
    session_id: str
    turn_count: int

    # Der Text der Geschichte
    last_narrative: str
    image_url: Optional[str] = None

    # Metadaten für das Frontend
    active_actor_name: str

    # DAS IST NEU: Der State für die UI (Inventar, Map, etc.)
    current_location: str
    current_quest: str
    inventory: List[str]

    # Optional: Debug History
    history: List[str] = []
