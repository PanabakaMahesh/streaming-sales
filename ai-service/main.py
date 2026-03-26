"""main.py — StreamSales AI v4 (Hybrid Conversational System)"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

from api.assistant_routes import router as assistant_router
from api.human_support_routes import router as human_router
from database import connect_db, disconnect_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    try:
        from model_loader import load_all; load_all()
    except RuntimeError as e:
        print(f"⚠️  {e}")
    yield
    await disconnect_db()


app = FastAPI(
    title="StreamSales AI v4 — Hybrid Conversational Assistant",
    description="Rule-based + NLP hybrid with persistent menus, guided flows, IRCTC-style interaction",
    version="4.0.0",
    lifespan=lifespan,
)

app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:3000","http://localhost:5000"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

app.include_router(assistant_router, prefix="/api/assistant", tags=["Assistant"])
app.include_router(human_router, prefix="/human-support", tags=["Human Support"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "StreamSales AI v4", "version": "4.0.0"}

@app.get("/")
def root():
    return {"service": "StreamSales AI v4", "docs": "/docs", "health": "/health"}
