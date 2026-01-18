"""
Haupteinstiegspunkt der Agentic Storyteller API.

Dieses Modul initialisiert die FastAPI Anwendung und konfiguriert:
- Middleware (CORS für Frontend-Integration)
- Router (Story-Endpoints)
- Health Check Endpoint

Die App kann mit uvicorn direkt ausgeführt werden:
    python -m app.main
    # oder
    uvicorn app.main:app --reload

Umgebung:
    HOST: 0.0.0.0 (alle Netzwerk-Interfaces)
    PORT: 8000
    RELOAD: True (Development Mode - automatisches Neuladen bei Änderungen)

CORS ist aktuell auf "*" konfiguriert (alle Origins). In der Produktion sollte dies
auf die spezifische Domain des Frontends eingeschränkt werden.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routers import story

# FastAPI Instanz mit Metadaten für Swagger UI
app = FastAPI(
    title="Agentic Storyteller API",
    version="1.0",
    description="Eine KI-gesteuerte API für interaktive, agentenbasierte Storytelling-Spiele"
)

# --- MIDDLEWARE KONFIGURATION ---

# CORS Middleware für Frontend-Integration
# Ermöglicht Requests von Frontend-Anwendungen (z.B. Next.js auf localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "https://ffd0313641ab.ngrok-free.app"],  # TODO: In Production auf ["https://yourdomain.com"] beschränken
    allow_credentials=True,  # Cookies & Authentifizierung erlauben
    allow_methods=["*"],  # GET, POST, etc.
    allow_headers=["*"],  # Alle Header erlauben
)

@app.middleware("http")
async def add_private_network_access_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Private-Network"] = "true"
    return response

# --- ROUTER REGISTRIERUNG ---

# Registriere alle Story-Endpoints (POST /story/start, POST /story/turn, etc.)
app.include_router(story.router)


# --- HEALTH CHECK ENDPOINT ---

@app.get("/")
def read_root():
    """
    Health Check Endpoint.

    Gibt den Status der API zurück. Wird verwendet um sicherzustellen,
    dass der Server läuft und erreichbar ist.

    Returns:
        dict: Status und Nachricht
              {"status": "ok", "message": "Storyteller Backend running"}
    """
    return {"status": "ok", "message": "Storyteller Backend running"}


# --- MAIN ENTRY POINT ---

if __name__ == "__main__":
    import uvicorn

    # Starte den Server mit uvicorn
    # - host="0.0.0.0": Lausche auf allen Netzwerk-Interfaces
    # - port=8000: Standard-Port für Development
    # - reload=True: Automatisches Neuladen bei Code-Änderungen (nur für Development!)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
