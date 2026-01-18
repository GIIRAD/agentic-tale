"""
Game Engine für Agentic Storyteller.

Dieses Modul implementiert die Kernlogik für agentenbasiertes interaktives Storytelling.
Es verwaltet GameSessions, Spielzustände und orchestriert den komplexen Storytelling-Prozess
mit mehreren LLM-Aufrufen (6-Schritt-Prozess):

1. ACTOR: Der aktive Agent führt eine Aktion durch
2. REACTOR: Andere Agenten reagieren
3. GAME_MASTER: Spielzustand wird aktualisiert
4. NARRATOR: Die Geschichte wird erzählt
5. ART_DIRECTOR: DALL-E Prompt wird generiert
6. SUMMARIZER: Kontext wird regelmäßig komprimiert

Datastrukturen:
    - Agent: Ein Charakter in der Geschichte
    - StoryState: Der Spielzustand (Ort, Inventar, Quest)
    - GameSession: Eine laufende Spiel-Session

Manager:
    - GameManager: Statische Methoden für Game-Logik

Globaler State:
    - GAMES: Dict mit allen aktiven GameSessions (TODO: In Prod durch DB ersetzen)
"""

import uuid
from typing import List, Dict, Optional
from dataclasses import dataclass, field
from app.services.llm_factory import call_llm, generate_image_url

# --- DATENSTRUKTUREN ---


@dataclass
class Agent:
    """
    Ein Charakter/Agent in der Geschichte.

    Agents sind die Akteure in der Story. Sie haben Rollen (Protagonist, Antagonist, etc.)
    und eine Persönlichkeit, die ihr Verhalten bestimmt.

    Attributes:
        name (str): Charaktername. Beispiel: "Aragorn", "Elara"
        role (str): Rolle in der Geschichte. Beispiel: "Protagonist", "Mentor", "Antagonist"
        description (str): Physische Beschreibung des Charakters.
        personality (str): Persönlichkeitstraits, die das Verhalten beeinflussen.
        is_active (bool): Ob dieser Agent in dieser Runde agieren kann.
                         Default: True. Wird von GameManager kontrolliert.
    """
    name: str
    role: str
    description: str
    personality: str
    is_active: bool = True


@dataclass
class StoryState:
    """
    Der persistente Spielzustand - das Gedächtnis der Geschichte.

    Dieses Objekt speichert alle relevanten Informationen über die aktuelle Spielsituation.
    Es wird bei jedem Turn aktualisiert und hilft der KI, konsistent zu bleiben.

    Attributes:
        location (str): Der aktuelle Ort des Charakters.
                       Default: "Startpunkt"
                       Wird vom GameMaster aktualisiert basierend auf Aktionen.
        inventory (List[str]): Gegenstände, die der Charakter trägt.
                              Wird im Frontend angezeigt und beeinflusst verfügbare Aktionen.
        current_quest (str): Das aktuelle Ziel/Quest des Charakters.
                            Default: "Erkunde die Welt"
                            Wird vom GameMaster aktualisiert basierend auf Fortschritt.
        active_threats (List[str]): Liste von Gefahren oder Antagonisten in der aktuellen Szene.
    """

    location: str = "Startpunkt"
    inventory: List[str] = field(default_factory=list)
    current_quest: str = "Erkunde die Welt"
    active_threats: List[str] = field(default_factory=list)

    def to_string(self) -> str:
        """
        Konvertiert den Spielzustand zu einem String für LLM-Prompts.

        Returns:
            str: Formatierter String mit Ort, Inventar und aktuellem Ziel.
                 Format: "Ort: ... | Inventar: ... | Ziel: ..."
        """
        return f"Ort: {self.location} | Inventar: {', '.join(self.inventory)} | Ziel: {self.current_quest}"


class GameSession:
    """
    Eine aktive Spiel-Session mit allen Daten und Historie.

    Eine GameSession repräsentiert ein laufendes Spiel. Sie enthält den Spielzustand,
    die Liste aller Agenten, die bisherige Narrative-Historie und Metadaten.

    Die Session wird vom GameManager erstellt und bei jedem Turn aktualisiert.
    """

    def __init__(self, session_id: str, setting: str, agents: List[Agent], style: str):
        """
        Initialisiert eine neue GameSession.

        Args:
            session_id (str): Eindeutige ID für diese Session (UUID).
            setting (str): Das Szenario/Setting der Geschichte.
                          Beispiel: "Ein Abenteuer in einem mystischen Wald"
            agents (List[Agent]): Liste der Charaktere in dieser Story.
            style (str): Visueller Stil für DALL-E Bilder.
                        Beispiel: "Cinematic", "Storybook", "Oil Painting"
        """
        self.session_id = session_id
        self.setting = setting
        self.agents = agents
        self.visual_style = style
        self.state = StoryState()

        # Duales Gedächtnis-System:
        # 1. Full Prose: Der vollständige Narrativ-Text für den Nutzer
        self.narrative_history: List[str] = []
        # 2. Summary: Komprimierte Zusammenfassung für LLM-Context (Token-Einsparung)
        self.plot_summary: str = f"Die Geschichte beginnt: {setting}"

        self.turn_count = 0
        self.last_image_url = ""

    def get_context_for_llm(self) -> str:
        """
        Baut den optimierten Kontext-String für LLM-Prompts.

        Kombiniert den aktuellen Spielzustand, die gespeicherte Plot-Summary
        und die letzten 3 Narrative-Blöcke zu einem strukturierten Prompt.
        Dies wird allen Agenten-Prompts übergeben, um Konsistenz zu gewährleisten.

        Returns:
            str: Formatierter Kontext mit Status, Summary und aktueller Szene.
        """
        recent_prose = "\n\n".join(self.narrative_history[-3:])  # Letzte 3 Absätze
        return (
            f"--- STORY STATUS ---\n{self.state.to_string()}\n"
            f"--- ZUSAMMENFASSUNG ---\n{self.plot_summary}\n"
            f"--- AKTUELLE SZENE ---\n{recent_prose}"
        )

    def get_agent(self, name: str) -> Optional[Agent]:
        """
        Sucht einen Agenten nach Name.

        Args:
            name (str): Der gesuchte Agenten-Name.

        Returns:
            Optional[Agent]: Der Agent oder None, falls nicht gefunden.
        """
        return next((a for a in self.agents if a.name == name), None)

    def rotate_active_actor(self) -> Agent:
        """
        Bestimmt den nächsten aktiven Agenten in dieser Runde.

        Implementiert einfache Round-Robin-Rotation: Jeder Agent agiert der Reihe nach.
        Es werden nur Agenten berücksichtigt, deren is_active=True ist.

        Returns:
            Agent: Der Agent, der in dieser Runde handelt.

        Raises:
            IndexError: Wenn keine aktiven Agenten existieren.
        """
        actives = [a for a in self.agents if a.is_active]
        
        if not actives:
            # Fallback: Falls keine Agenten als aktiv markiert sind (z.B. falsche Rollen),
            # nutze alle verfügbaren Agenten, um Crash zu vermeiden.
            actives = self.agents
            
        if not actives:
             raise IndexError("No agents available in game session.")

        actor = actives[self.turn_count % len(actives)]
        return actor


# --- LOGIC ENGINE (Manager Klasse) ---

# Globaler State: Speichert alle aktiven GameSessions
# In Production sollte dies durch eine Datenbank ersetzt werden
GAMES: Dict[str, GameSession] = {}


class GameManager:
    """
    Game Manager für die Verwaltung von GameSessions.

    Diese Klasse enthält die Kernlogik für die Spielablauf:
    - create_game(): Erstellt eine neue Session mit generierten Agenten
    - process_turn(): Verarbeitet eine Runde mit 6-Schritt-Orchestrierung
    - _update_summary(): Komprimiert die Historie regelmäßig

    Die Methoden sind statisch und operieren auf dem globalen GAMES-Dict.
    """

    @staticmethod
    def create_game(scenario: str) -> GameSession:
        """
        Erstellt eine neue GameSession mit generiertem Cast und Setting.

        Dieser Prozess nutzt die LLM um basierend auf einem Szenario:
        - Charaktere/Agenten zu generieren (mit Namen, Rollen, Beschreibungen)
        - Den visuellen Stil festzulegen
        - Die Startposition zu bestimmen

        Args:
            scenario (str): Das Spielszenario/Thema.
                           Beispiel: "Ein Piraten-Abenteuer auf hoher See"

        Returns:
            GameSession: Die neu erstellte Session, oder None bei Fehler.

        Raises:
            Exception: Bei LLM-Aufruf oder Verarbeitungsfehlern (wird geloggt).
        """
        # Prompt verfeinert für tiefere Charaktere
        sys_prompt = """Du bist ein erfahrener Showrunner. Erstelle ein Cast für: {scenario}.
        JSON Format:
        {
          "agents": [
            {"name": "...", "role": "Protagonist/Mentor/Antagonist", "description": "...", "personality": "..."}
          ],
          "visual_style": "...",
          "starting_location": "..."
        }"""

        try:
            data = call_llm(sys_prompt, scenario, temperature=0.7, json_mode=True)
            agents = [
                Agent(**a, is_active=(a["role"] == "Protagonist"))
                for a in data.get("agents", [])
            ]

            session = GameSession(
                str(uuid.uuid4()),
                scenario,
                agents,
                data.get("visual_style", "Cinematic"),
            )
            session.state.location = data.get("starting_location", "Unknown")

            GAMES[session.session_id] = session
            return session
        except Exception as e:
            print(f"Error creating game: {e}")
            return None

    @staticmethod
    def process_turn(session_id: str, user_intervention: str = None) -> GameSession:
        """
        Verarbeitet eine Spielrunde mit 6-Schritt-Orchestrierung.

        Diese Methode ist das Herzstück der Storytelling-Engine. Sie orchestriert
        einen komplexen Prozess mit mehreren LLM-Aufrufen:

        1. ACTOR: Der aktive Agent führt eine Aktion durch
        2. REACTOR: Andere Agenten reagieren auf die Aktion
        3. GAME_MASTER: Der Spielzustand wird aktualisiert basierend auf der Aktion
        4. NARRATOR: Die Geschichte wird erzählt mit allen Details
        5. ART_DIRECTOR: Ein DALL-E Prompt wird für die Szene generiert
        6. SUMMARIZER: Alle 3 Turns wird die Historie komprimiert

        Args:
            session_id (str): Die ID der GameSession.
            user_intervention (Optional[str]): Optionale Eingabe des Spielers, die die Geschichte beeinflusst.
                                              Default: None (KI entscheidet)

        Returns:
            GameSession: Die aktualisierte Session, oder None falls ID ungültig.
        """
        game = GAMES.get(session_id)
        if not game:
            return None

        game.turn_count += 1
        current_actor = game.rotate_active_actor()
        context = game.get_context_for_llm()

        # SCHRITT 1: DER AKTEUR HANDELT (Intention)
        # Wir geben dem Akteur mehr Freiheit, aber zwingen ihn, auf den State zu achten
        sys_actor = (
            f"Du bist {current_actor.name} ({current_actor.description}). "
            f"Persönlichkeit: {current_actor.personality}.\n"
            f"Handle basierend auf dem aktuellen Ziel: {game.state.current_quest}.\n"
            "Schreibe deine Handlung und wörtliche Rede (in Anführungszeichen)."
        )
        user_prompt_actor = f"{context}\n\nEinfluss von Außen (Fate): {user_intervention or 'Nichts'}\nWas tust du?"
        actor_raw_action = call_llm(sys_actor, user_prompt_actor, temperature=0.8)

        # SCHRITT 2: DYNAMISCHE REAKTION (Simulierte Gruppenintelligenz)
        # Statt Keyword-Matching lassen wir die AI entscheiden, wer reagieren MUSS.
        reaction_text = ""
        # Wir fragen ein "Regisseur-Modell", wer reagieren sollte (Performance-Optimierung: Man könnte auch einfach alle fragen)
        passive_agents = [a for a in game.agents if a.name != current_actor.name]
        if passive_agents:
            sys_react = "Du bist Co-Autor. Wer muss auf diese Aktion reagieren? Antworte kurz aus deren Sicht. Wenn niemand, antworte 'PASS'."
            names = ", ".join([a.name for a in passive_agents])
            user_react = f"Aktion von {current_actor.name}: {actor_raw_action}\nAnwesende: {names}"
            reaction_raw = call_llm(sys_react, user_react, temperature=0.6)
            if "PASS" not in reaction_raw:
                reaction_text = reaction_raw

        # SCHRITT 3: GAME MASTER (State Update Only)
        # Der GM schreibt keine Geschichte mehr, er aktualisiert nur die Datenbank.
        sys_gm = """Du bist der Game Engine Logic Processor.
        Analysiere die Aktion und aktualisiere den Status.
        JSON Output: {
            "new_location": "...", (nur wenn geändert, sonst null)
            "inventory_changes": ["+Item", "-Item"],
            "quest_update": "...", (Neues Ziel oder null)
            "success": true/false
        }"""
        user_gm = f"Old State: {game.state.to_string()}\nAction: {actor_raw_action}\nFate: {user_intervention}"
        gm_data = call_llm(sys_gm, user_gm, temperature=0.2, json_mode=True)

        # State anwenden
        if gm_data.get("new_location"):
            game.state.location = gm_data["new_location"]
        if gm_data.get("quest_update"):
            game.state.current_quest = gm_data["quest_update"]
        # (Inventar-Logik hier vereinfacht)

        # SCHRITT 4: DER ERZÄHLER (Synthesis)
        # Hier passiert die Magie: Wir geben dem Erzähler ALLE Puzzleteile.
        sys_narrator = (
            "Du bist ein Romanautor. Schreibe den nächsten Abschnitt der Geschichte."
            "WICHTIG: Der Leser sieht NICHT den Input-Text des Akteurs. "
            "Du musst die Handlung des Akteurs (z.B. Dialoge, Begegnungen, Aktionen) "
            "explizit in deinen Text integrieren und ausschreiben. "
            "Fasse nicht nur das Ergebnis zusammen, sondern erzähle, wie es dazu kam."
            "REGEL 1: Der Leser kennt die 'Input Daten' NICHT. Du musst sie im Text darstellen."
            "REGEL 2: Wenn der Akteur etwas sagt oder jemanden trifft, muss das im Text vorkommen."
            "REGEL 3: Vermeide Zusammenfassungen wie 'Nachdem sie sich trafen...', sondern schreibe die Szene aus."
        )
        user_narrator = (
            f"Stil: {game.visual_style}\n"
            f"Letzter Absatz (Kontext): {game.narrative_history[-1] if game.narrative_history else 'Start.'}\n\n"
            f"JETZT PASSIERT FOLGENDES (Integriere dies in die Geschichte):\n"  # Deutlicherer Header
            f"1. AKTION ({current_actor.name}): {actor_raw_action}\n"
            f"2. REAKTIONEN: {reaction_text}\n"
            f"3. ERGEBNIS: {'Erfolg' if gm_data.get('success') else 'Fehlschlag'}. "
            f"Neues Ziel: {game.state.current_quest}."
        )
        final_prose = call_llm(sys_narrator, user_narrator, temperature=0.85)

        game.narrative_history.append(final_prose)

        # SCHRITT 5: VISUALISIERUNG
        # Optimierung: Wir nutzen die Prose UND den Style für das Bild
        sys_art = (
            "Du bist Art Director für ein Kinderbuch. "
            "Erstelle einen DALL-E Prompt (englisch). "
            "WICHTIG: Vermeide urheberrechtlich geschützte Namen. "
            "Beschreibe Figuren abstrakt (z.B. 'a lemon character' statt 'Lenny Lemon'). "
            "Vermeide Begriffe, die Gewalt oder Anzüglichkeit missverstanden werden könnten."
        )
        prompt = call_llm(sys_art, f"Style: {game.visual_style}\nText: {final_prose}")
        game.last_image_url = generate_image_url(prompt)

        # SCHRITT 6: ZUSAMMENFASSUNG AKTUALISIEREN (Alle 3 Züge oder so)
        if game.turn_count % 3 == 0:
            GameManager._update_summary(game)

        return game

    @staticmethod
    def _update_summary(game: GameSession):
        """
        Komprimiert die bisherige Narrative-Historie zu einer Summary.

        Diese Methode wird alle 3 Turns aufgerufen, um zu verhindern, dass
        der LLM-Kontext zu groß wird ("context explosion"). Die Summary
        wird in plot_summary gespeichert und in zukünftigen Prompts verwendet.

        Args:
            game (GameSession): Die Session, deren Historie komprimiert werden soll.
        """
        sys_sum = "Fasse die bisherige Handlung in 3 Sätzen zusammen. Behalte wichtige Fakten (Orte, Items)."
        full_text = "\n".join(game.narrative_history)
        game.plot_summary = call_llm(sys_sum, full_text)
