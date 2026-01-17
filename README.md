# Agentic Storyteller

Eine KI-gesteuerte interaktive Storytelling-Plattform, die dynamische Geschichten mit mehreren Agenten generiert, visuelle Effekte mit DALL-E erstellt und die LLM-Nutzung mit Langfuse trackt.

## Features

- **Agenten-basiertes Storytelling**: Mehrere KI-gesteuerte Charaktere arbeiten zusammen, um Geschichten zu erzählen
- **Dynamische Szenarios**: Unbegrenzte Handlungsmöglichkeiten basierend auf LLM-Generierung
- **Visuelle Generierung**: DALL-E 3 Integration für bildliche Darstellung von Szenen
- **LLM Monitoring**: Langfuse Integration für Tracking und Optimierung von LLM-Calls
- **Kontexterhaltung**: Duales Gedächtnis (Prose für Nutzer, Summaries für AI) zur Vermeidung von Kontextverlust
- **CORS-enabled REST API**: FastAPI-basiertes Backend für einfache Integration

## Architektur

```
agentic-tale/
├── backend/                    # Python FastAPI Backend
│   ├── requirements.txt        # Dependencies (FastAPI, OpenAI, Langfuse, etc.)
│   └── app/
│       ├── main.py            # FastAPI Anwendung
│       ├── core/
│       │   └── config.py       # Konfiguration (Azure OpenAI, Langfuse)
│       ├── models/
│       │   └── schemas.py      # Pydantic Schemas
│       ├── routers/
│       │   └── story.py        # Story-Endpoints
│       └── services/
│           ├── game_engine.py  # Kernlogik (GameSession, GameManager)
│           └── llm_factory.py  # LLM-Abstraktion
├── web/                        # Next.js Frontend
│   ├── package.json           # Dependencies (React, Next.js, TanStack Query)
│   ├── src/
│   │   ├── app/               # Next.js Pages
│   │   ├── components/        # React Komponenten
│   │   ├── services/          # API-Client Services
│   │   └── util/              # Utility Functions
│   └── public/                # Statische Assets
├── langfuse/                  # Langfuse Observability (optional)
└── static/                    # Zusätzliche Statische Assets
```

## Tech Stack

### Backend

- **FastAPI** 0.128.0 - Modernes Python Web Framework
- **Azure OpenAI** - GPT-4o für Text-Generierung
- **Azure DALL-E 3** - Bild-Generierung
- **Langfuse 3.11.2** - LLM Monitoring & Observability
- **OpenTelemetry** - Distributed Tracing
- **Pydantic 2.12.5** - Datenvalidierung

### Frontend

- **Next.js 15.5.9** - React Framework
- **React 19.2.3** - UI-Library
- **TanStack Query 5.83.0** - State Management
- **Zod 3.25.30** - Typ-sichere Validierung
- **Tailwind CSS** - Styling
- **TipTap 3.0.7** - Rich Text Editor

## Installation & Setup

### Voraussetzungen

- Python 3.8+
- Node.js 18+ (laut .nvmrc)
- Azure OpenAI Credentials
- Langfuse Account (optional)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Erstelle eine `.env` Datei:

```env
AZURE_ENDPOINT=your_azure_endpoint
AZURE_API_KEY=your_azure_key
AZURE_ENDPOINT_DALLE=your_dalle_endpoint
AZURE_API_KEY_DALLE=your_dalle_key
LANGFUSE_PUBLIC_KEY=your_public_key
LANGFUSE_SECRET_KEY=your_secret_key
LANGFUSE_BASE_URL=https://langfuse.com
```

Starte den Server:

```bash
python fastapi run app.main.py
# oder
python -m app.main
# oder
uvicorn app.main:app --reload
```

Der API läuft unter `http://localhost:8000`

### Frontend Setup

```bash
cd web
npm install
npm run dev
```

Frontend läuft unter `http://localhost:3000`

## API Endpoints

### Base URL

```
http://localhost:8000
```

### Health Check

```
GET /
```

### Story Endpoints

Siehe [routers/story.py](backend/app/routers/story.py) für Details.

## Verwendung

1. **Starten** Sie ein Spiel mit einem Szenario
2. **Agenten** werden automatisch generiert basierend auf dem Setting
3. **Turns** werden verarbeitet, wobei Agenten abwechselnd handeln
4. **Bilder** werden für wichtige Szenen generiert
5. **Kontext** wird durch Summaries optimal genutzt

## Entwicklung

### Debugging

- Backend: Nutze die FastAPI Swagger UI unter `/docs`
- Frontend: Browser DevTools

### Linting & Formatting

```bash
# Web
npm run lint
npm run format

# Backend
# Nutze black, flake8 oder ähnliches
```

### Docker

Docker Compose Konfigurationen sind vorhanden für schnelles Deployment.

## Konfiguration

Alle Einstellungen sind in `backend/app/core/config.py` definiert:

- Azure OpenAI Endpoints
- Langfuse Tracking
- OpenTelemetry Export
