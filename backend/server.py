import os
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
notes_collection = db["notes"]

# Helper to format MongoDB docs
def format_doc(doc: dict) -> dict:
    if not doc:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc

# Pydantic Models
class NoteBase(BaseModel):
    title: str = ""
    content: str = ""
    color: str = "bg-card"

class NoteCreate(NoteBase):
    pass

class NoteUpdate(NoteBase):
    pass

class Note(NoteBase):
    id: str
    createdAt: datetime

@app.get("/api")
async def health_check():
    return {"status": "healthy", "message": "Notes API is running"}

@app.get("/api/notes", response_model=List[Note])
async def get_notes():
    cursor = notes_collection.find().sort("createdAt", -1)
    notes = []
    async for doc in cursor:
        notes.append(format_doc(doc))
    return notes

@app.post("/api/notes", response_model=Note)
async def create_note(note: NoteCreate = Body(...)):
    note_dict = note.model_dump()
    note_dict["createdAt"] = datetime.utcnow()
    result = await notes_collection.insert_one(note_dict)
    new_note = await notes_collection.find_one({"_id": result.inserted_id})
    return format_doc(new_note)

@app.put("/api/notes/{note_id}", response_model=Note)
async def update_note(note_id: str, note: NoteUpdate = Body(...)):
    if not ObjectId.is_valid(note_id):
        raise HTTPException(status_code=400, detail="Invalid note ID")
    
    update_data = {k: v for k, v in note.model_dump().items() if v is not None}
    result = await notes_collection.update_one(
        {"_id": ObjectId(note_id)}, 
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
        
    updated_note = await notes_collection.find_one({"_id": ObjectId(note_id)})
    return format_doc(updated_note)

@app.delete("/api/notes/{note_id}")
async def delete_note(note_id: str):
    if not ObjectId.is_valid(note_id):
        raise HTTPException(status_code=400, detail="Invalid note ID")
        
    result = await notes_collection.delete_one({"_id": ObjectId(note_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
        
    return {"status": "success", "message": "Note deleted"}
