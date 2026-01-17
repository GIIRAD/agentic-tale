from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import story

app = FastAPI(
    title="Agentic Storyteller API",
    version="1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Für Prod einschränken auf deine Next.js Domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router registrieren
app.include_router(story.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Storyteller Backend running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)