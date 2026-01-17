"""
Konfigurationsmodul für die Agentic Storyteller API.

Dieses Modul lädt Umgebungsvariablen aus einer .env Datei und stellt sie
als globale Settings-Instanz zur Verfügung. Alle sensitiven Daten (API-Keys, Endpoints)
werden hier zentral verwaltet und validiert.

Die Settings-Klasse nutzt Pydantic für Typ-Validierung und automatische Konvertierung.

Environment Variables erforderlich:
    - AZURE_ENDPOINT: Azure OpenAI API Endpoint für GPT-4
    - AZURE_API_KEY: API Key für Azure OpenAI Chat
    - AZURE_ENDPOINT_DALLE: Azure OpenAI API Endpoint für DALL-E
    - AZURE_API_KEY_DALLE: API Key für Azure DALL-E
    - LANGFUSE_PUBLIC_KEY: Public Key für Langfuse Observability
    - LANGFUSE_SECRET_KEY: Secret Key für Langfuse Observability
    - LANGFUSE_BASE_URL: Base URL der Langfuse Instanz

Beispiel .env Datei:
    AZURE_ENDPOINT=https://<your-resource>.openai.azure.com/
    AZURE_API_KEY=your_azure_openai_key
    AZURE_ENDPOINT_DALLE=https://<your-dalle-resource>.openai.azure.com/
    AZURE_API_KEY_DALLE=your_dalle_key
    LANGFUSE_PUBLIC_KEY=your_public_key
    LANGFUSE_SECRET_KEY=your_secret_key
    LANGFUSE_BASE_URL=https://langfuse.com
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Globale Anwendungskonfiguration mit Pydantic BaseSettings.

    Diese Klasse liest Umgebungsvariablen aus der .env Datei und validiert sie.
    Sie wird zur Laufzeit als Singleton instanziiert und bietet zentrale
    Zugriffspunkte auf alle API-Credentials und Endpoints.

    Attributes:
        AZURE_ENDPOINT (str): URL des Azure OpenAI Endpoints für Chat-Modelle (GPT-4).
                             Format: https://<resource-name>.openai.azure.com/
        AZURE_API_KEY (str): API Key zur Authentifizierung bei Azure OpenAI Chat.
                            Sollte niemals in Code hardcodiert werden.

        API_VERSION (str): Azure OpenAI API Version.
                          Default: "2024-02-15-preview"
                          Definiert welche API-Features verfügbar sind.

        DEPLOYMENT_NAME (str): Name der Azure Deployment für das Chat-Modell.
                              Default: "gpt-4o"
                              Entspricht dem Namen in Azure Portal.

        AZURE_ENDPOINT_DALLE (str): URL des Azure OpenAI Endpoints für Bild-Generierung.
                                   Format: https://<resource-name>.openai.azure.com/
        AZURE_API_KEY_DALLE (str): API Key zur Authentifizierung bei Azure DALL-E.

        DEPLOYMENT_DALLE3 (str): Name der Azure Deployment für DALL-E 3.
                                Default: "dall-e-3"
                                Entspricht dem Namen in Azure Portal.

        LANGFUSE_PUBLIC_KEY (str): Public Key für Langfuse Observability Service.
                                  Wird für Authentication bei Langfuse API verwendet.
        LANGFUSE_SECRET_KEY (str): Secret Key für Langfuse.
                                  Muss absolut geheim behandelt werden.
        LANGFUSE_BASE_URL (str): Base URL der Langfuse Instanz.
                                Default (extern): https://langfuse.com
                                Kann für Self-Hosted Instanzen angepasst werden.

    Config:
        env_file: Path zur .env Datei (default: ".env" im root directory)
    """

    # --- AZURE OPENAI CHAT (GPT-4) ---
    AZURE_ENDPOINT: str
    AZURE_API_KEY: str
    API_VERSION: str = "2024-02-15-preview"
    DEPLOYMENT_NAME: str = "gpt-4o"

    # --- AZURE OPENAI DALL-E (Image Generation) ---
    AZURE_ENDPOINT_DALLE: str
    AZURE_API_KEY_DALLE: str
    DEPLOYMENT_DALLE3: str = "dall-e-3"

    # --- LANGFUSE (LLM Observability) ---
    LANGFUSE_PUBLIC_KEY: str
    LANGFUSE_SECRET_KEY: str
    LANGFUSE_BASE_URL: str

    class Config:
        """Pydantic Config für Settings."""
        env_file = ".env"


# Globale Settings-Instanz
# Diese wird beim Import instantiiert und lädt alle Umgebungsvariablen
settings = Settings()  # type: ignore