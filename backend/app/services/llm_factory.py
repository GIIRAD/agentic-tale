"""
LLM Factory für die Agentic Storyteller API.

Dieses Modul kapselt alle Interaktionen mit externen LLM- und Bild-Generierungs-Diensten:

- Azure OpenAI (GPT-4o): Text-Generierung für Storytelling
- Azure DALL-E 3: Bild-Generierung für visuelle Szenen
- Langfuse: Observability und Tracking der LLM-Aufrufe

Die @observe Decorator ermöglichen automatisches Tracking von LLM-Aufrufen über Langfuse.

Client Initialisierung:
    - client: Azure OpenAI für Chat/Text-Modelle (GPT-4o)
    - client_dalle: Azure OpenAI für Bild-Modelle (DALL-E 3)
    - langfuse: Langfuse Instance für Observability

Funktionen:
    - call_llm(): Generiert Text mit GPT-4o (mit optionalem JSON-Modus)
    - generate_image_url(): Generiert Bilder mit DALL-E 3
"""

import json
from typing import Union
from openai import AzureOpenAI
from langfuse import Langfuse, observe
from app.core.config import settings

# --- CLIENT INITIALISIERUNG ---

# Azure OpenAI Client für Chat/Text-Modelle (GPT-4o)
client = AzureOpenAI(
    azure_endpoint=settings.AZURE_ENDPOINT,
    api_key=settings.AZURE_API_KEY,
    api_version=settings.API_VERSION
)

# Azure OpenAI Client für Bild-Generierung (DALL-E 3)
client_dalle = AzureOpenAI(
    azure_endpoint=settings.AZURE_ENDPOINT_DALLE,
    api_key=settings.AZURE_API_KEY_DALLE,
    api_version="2024-02-01",
)

# Langfuse Client für LLM Observability und Tracking
langfuse = Langfuse(
    public_key=settings.LANGFUSE_PUBLIC_KEY,
    secret_key=settings.LANGFUSE_SECRET_KEY,
    host=settings.LANGFUSE_BASE_URL,
)


# --- FUNKTIONEN ---

@observe(as_type="generation")
def call_llm(system_prompt: str, user_prompt: str, temperature: float = 0.7, json_mode: bool = False) -> Union[str, dict]:
    """
    Ruft das Azure OpenAI GPT-4o Modell auf und generiert Text.

    Diese Funktion ist der zentrale Kontaktpunkt für alle Text-Generierung in der App.
    Sie wird für verschiedenste Aufgaben verwendet:
    - Charakter-Generierung beim Spielstart
    - Agenten-Aktionen während des Spiels
    - Game Master Logik (State Updates)
    - Narrative-Generierung (Story-Text)
    - Bild-Prompt-Generierung für DALL-E

    Die @observe Decorator automatisiert das Tracking via Langfuse.

    Args:
        system_prompt (str): Das System-Prompt (definiert die KI-Rolle/Verhalten).
                            Beispiel: "Du bist ein Showrunner. Erstelle Charaktere..."
        user_prompt (str): Das User-Prompt (die aktuelle Aufgabe/Anfrage).
                          Beispiel: "Erstelle einen Cast für: Ein Piraten-Abenteuer"
        temperature (float): Kreativitäts-Parameter (0.0-2.0).
                            0.0 = deterministisch, 1.0 = balanced, > 1.0 = sehr kreativ.
                            Default: 0.7 (für balanced Text-Generierung)
        json_mode (bool): Wenn True, wird erwartet dass die KI JSON zurückgibt.
                         Das response_format wird entsprechend gesetzt.
                         Default: False

    Returns:
        Union[str, dict]: 
            - Wenn json_mode=False: Der generierte Text als String
            - Wenn json_mode=True: Das geparste JSON als Dictionary
            - Bei Fehler: "" (leerer String) oder {} (leeres Dict)

    Raises:
        Exception: Wird geloggt aber nicht weitergegeben. Return-Wert wird stattdessen leer.

    Beispiele:
        # Einfache Text-Generierung
        story = call_llm("Du bist ein Autor", "Schreibe eine kurze Geschichte")

        # JSON-Modus für strukturierte Daten
        chars = call_llm("Generiere JSON", "...", json_mode=True)
        # Rückgabe: {"agents": [...], "style": "..."}

        # Niedriger Temperature für konsistente Ergebnisse
        summary = call_llm(sys, prompt, temperature=0.2)
    """
    try:
        kwargs = {
            "model": settings.DEPLOYMENT_NAME,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temperature,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        # Rufe das GPT-4o Modell auf
        response = client.chat.completions.create(**kwargs)
        content = response.choices[0].message.content
        
        # Wenn JSON-Modus: Parse und return als Dictionary
        if json_mode:
            return json.loads(content)
        return content
    except Exception as e:
        print(f"LLM Error: {e}")
        return {} if json_mode else ""

@observe(as_type="generation")
def generate_image_url(prompt: str) -> str:
    """
    Generiert ein Bild basierend auf einem Prompt mit Azure DALL-E 3.

    Diese Funktion wird nach jedem Story-Turn aufgerufen, um die aktuelle Szene
    visuell darzustellen. Der Prompt wird vom LLM generiert basierend auf der
    Geschichte und dem visuellen Style.

    Die @observe Decorator automatisiert das Tracking via Langfuse.

    Args:
        prompt (str): Der DALL-E Prompt (englisch empfohlen).
                     Der Prompt sollte detailliert sein und den visuellen Stil beschreiben.
                     Beispiel: "A cinematic scene of a wizard in a mystical forest..."

    Returns:
        str: Die URL des generierten Bildes (DALL-E service URL).
             Bei Fehler: "" (leerer String)

    Raises:
        Exception: Wird geloggt aber nicht weitergegeben. Return-Wert wird stattdessen leer.

    Konfiguration:
        - Model: DALL-E 3 (settings.DEPLOYMENT_DALLE3)
        - Size: 1024x1024
        - Style: vivid (detailliert und lebendig)
        - Quality: standard (kostet weniger als "hd")

    Hinweise:
        - DALL-E hat strenge Content-Policy. Keine Gewalt, Urheberrechte, etc.
        - Der Prompt sollte generische Beschreibungen verwenden (z.B. "an elf" statt "Legolas")
        - URLs sind temporär und verfallen nach einigen Tagen.
    """
    try:
        result = client_dalle.images.generate(
            model=settings.DEPLOYMENT_DALLE3,
            prompt=prompt,
            n=1,
            size="1024x1024",
            style="vivid",
            quality="standard",
        )
        return result.data[0].url
    except Exception as e:
        print(f"DALL-E Error: {e}")
        return ""