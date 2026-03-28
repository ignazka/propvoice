from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from livekit import api
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="PropVoice API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/token")
async def get_token():
    token = api.AccessToken(
        os.getenv("LIVEKIT_API_KEY"),
        os.getenv("LIVEKIT_API_SECRET"),
    )
    token.with_identity("mieter").with_name("Mieter")
    token.with_grants(api.VideoGrants(room_join=True, room="schadensmeldung"))
    return {
        "token": token.to_jwt(),
        "url": os.getenv("LIVEKIT_URL"),
    }
