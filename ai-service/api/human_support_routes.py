"""api/human_support_routes.py — Secure internal support folder API."""
import os, subprocess
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from support.human_support_router import list_incoming, save_agent_response, mark_reviewed, forward_to_seller, get_counts
from database import get_db

router = APIRouter()
SECRET = os.getenv("SUPPORT_SECRET", "support-secret-change-this")


def _auth(s):
    if s != SECRET: raise HTTPException(status_code=403, detail="Access denied.")


class RespondReq(BaseModel):
    agentId: str
    finalResponse: str
    action: str = "resolve"
    sellerId: Optional[str] = None
    correctCategory: Optional[str] = None
    notes: Optional[str] = None


@router.get("/incoming")
def get_incoming(x_support_secret: str = Header(None)):
    _auth(x_support_secret)
    return {"counts": get_counts(), "tickets": list_incoming()}


@router.get("/incoming/count")
def count(x_support_secret: str = Header(None)):
    _auth(x_support_secret)
    return get_counts()


@router.post("/incoming/{ticket_id}/respond")
async def respond(ticket_id: str, body: RespondReq, x_support_secret: str = Header(None)):
    _auth(x_support_secret)
    save_agent_response(ticket_id, {
        "agentId": body.agentId, "finalResponse": body.finalResponse,
        "action": body.action, "notes": body.notes,
        "respondedAt": datetime.utcnow().isoformat(),
    })
    mark_reviewed(ticket_id)
    new_status = "Closed" if body.action == "close" else "Resolved by Human"
    db = get_db()
    if db:
        await db.tickets.update_one({"ticketId": ticket_id}, {"$set": {
            "status": new_status, "resolvedBy": "human",
            "adminResponse": body.finalResponse,
            "resolvedAt": datetime.utcnow(), "updatedAt": datetime.utcnow(),
            "humanFeedback": {"agentId": body.agentId, "action": body.action, "notes": body.notes},
        }})
        ticket = await db.tickets.find_one({"ticketId": ticket_id})
        if ticket:
            correct = body.correctCategory or ticket.get("predictedCategory", "")
            await db.training_feedback.insert_one({
                "ticketId": ticket_id,
                "originalText": ticket.get("ticketText", ""),
                "predictedCategory": ticket.get("predictedCategory", ""),
                "correctCategory": correct,
                "confirmedCorrect": body.action in ["resolve", "close"],
                "createdAt": datetime.utcnow(),
            })
            if body.correctCategory:
                _append_training(ticket.get("ticketText", ""), body.correctCategory)
    if body.action == "forward_to_seller" and body.sellerId:
        t = await db.tickets.find_one({"ticketId": ticket_id}) if db else {}
        forward_to_seller(t or {}, body.sellerId)
    return {"ticketId": ticket_id, "status": new_status, "message": "Response saved."}


@router.post("/retrain")
def retrain(x_support_secret: str = Header(None)):
    _auth(x_support_secret)
    try:
        script = os.path.join(os.path.dirname(__file__), "..", "training", "train_model.py")
        r = subprocess.run(["python", script], capture_output=True, text=True, timeout=120)
        return {"status": "success" if r.returncode == 0 else "error",
                "output": r.stdout or r.stderr}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def _append_training(text, category):
    csv = os.path.join(os.path.dirname(__file__), "..", "data", "training_data.csv")
    try:
        with open(csv, "a") as f:
            f.write(f'"{text.replace(chr(34), chr(39))}",support_request,{category}\n')
    except: pass
