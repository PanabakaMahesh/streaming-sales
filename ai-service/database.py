"""database.py"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
_client = _db = None

async def connect_db():
    global _client, _db
    _client = AsyncIOMotorClient(os.getenv("MONGODB_URI","mongodb://localhost:27017/streaming-sales"))
    _db = _client.get_default_database()
    print("✅ AI Service v4 connected to MongoDB")

async def disconnect_db():
    if _client: _client.close()

def get_db(): return _db
