"""
Pydantic Schemas für die Agentic Storyteller API.

Dieses Modul definiert alle Request- und Response-Modelle für die REST-API.
Die Schemas dienen zur Validierung von Ein- und Ausgaben sowie zur automatischen
OpenAPI-Dokumentation (Swagger UI).

Schemas:
    - StartRequest: Initiiert ein neues Spiel
    - TurnRequest: Verarbeitet eine Spielrunde
    - AgentData: Daten eines Agenten/Charakters
    - GameStateResponse: Aktueller Spielzustand für das Frontend
"""

from typing import List, Optional
from pydantic import BaseModel


class StartRequest(BaseModel):
    """
    Request-Schema zum Starten eines neuen Spiels.

    Attributes:
        scenario (str): Das Szenario oder Thema für die Geschichte.
                        Wird an die LLM übergeben, um Agenten und Setting zu generieren.
                        Beispiel: "Ein Abenteuer in einem mystischen Wald"
    """

    scenario: str


class TurnRequest(BaseModel):
    """
    Request-Schema für die Verarbeitung einer einzelnen Spielrunde.

    Attributes:
        session_id (str): Die eindeutige ID der GameSession.
                          Wird beim Start des Spiels generiert.
        fate_intervention (Optional[str]): Optionale Eingabe des Benutzers, die die Geschichte beeinflusst.
                                           Wenn leer, entscheiden die Agenten selbst die nächste Aktion.
                                           Beispiel: "Der Spieler öffnet die geheime Tür"
    """

    session_id: str
    fate_intervention: Optional[str] = ""


class AgentData(BaseModel):
    """
    Schema für einen Agenten/Charakter in der Geschichte.

    Attributes:
        name (str): Der Name des Charakters. Beispiel: "Aragorn", "Elara"
        description (str): Detaillierte Beschreibung des Charakters.
                          Wird an die LLM übergeben für konsistente Charakterisierung.
    """

    name: str
    description: str


class GameStateResponse(BaseModel):
    """
    Response-Schema für den aktuellen Spielzustand.

    Wird nach jedem Turn vom Backend zum Frontend gesendet und enthält
    alle Informationen, die für die UI-Darstellung benötigt werden.

    Attributes:
        session_id (str): Die eindeutige ID dieser GameSession.
        turn_count (int): Anzahl der Runden, die gespielt wurden.

        last_narrative (str): Der vom LLM generierte Narrativ-Text der aktuellen Szene.
                              Dies ist der Haupttext, den der Spieler liest.
        image_url (Optional[str]): URL zum generierten DALL-E Bild für diese Szene.
                                   Ist None, wenn noch kein Bild generiert wurde.

        active_actor_name (str): Name des Agenten, der diese Runde agiert.
                                 Wird im Frontend angezeigt um Klarheit zu schaffen.

        current_location (str): Der aktuelle Ort in der Geschichte.
                                Teil des Spielzustands (StoryState).
        current_quest (str): Das aktuelle Ziel/Quest des Charakters.
        inventory (List[str]): Liste der Gegenstände im Inventar.
                               Wird für Gameplay-Logik und UI angezeigt.

        history (List[str]): Optional: Debaginformationen oder historische Narrative.
                             Nützlich für Entwicklung und Fehlersuche.
                             Wird im Frontend wahrscheinlich nicht angezeigt.
    """

    session_id: str
    turn_count: int
    last_narrative: str
    image_url: Optional[str] = None
    active_actor_name: str
    current_location: str
    current_quest: str
    inventory: List[str]
    history: List[str] = []
