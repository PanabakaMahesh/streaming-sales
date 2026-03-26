"""support/ticket_manager.py — Ticket CRUD + human response check."""
import uuid, os, json
from datetime import datetime
from database import get_db

HR_DIR = os.path.join(os.path.dirname(__file__), "..", "human_support", "human_responses")


async def create_ticket(text, user_id, result, session_id=None):
    cl = result.get("classification") or {}
    rt = result.get("routing") or {}
    ex = result.get("explainability") or {}

    ticket = {
        "ticketId":          f"TKT-{uuid.uuid4().hex[:8].upper()}",
        "userId":            user_id,
        "sessionId":         session_id,
        "ticketText":        text,
        "type":              result.get("type", "support_request"),
        "predictedCategory": cl.get("predicted_category", "general_query"),
        "predictedLabel":    cl.get("predicted_label", "General Query"),
        "confidenceScore":   cl.get("confidence", 0.0),
        "allScores":         cl.get("all_scores", {}),
        "suggestedSolution": result.get("message", ""),
        "importantKeywords": ex.get("important_words", []),
        "status":            rt.get("status", "Pending Human Review") if rt.get("requires_human") else "Auto Resolved",
        "priority":          rt.get("priority", "LOW"),
        "requiresHuman":     rt.get("requires_human", False),
        "isSensitive":       result.get("routing", {}).get("is_seller_escalation", False),
        "isProductDispute":  rt.get("is_seller_escalation", False),
        "adminResponse":     None,
        "resolvedBy":        None,
        "resolvedAt":        None,
        "createdAt":         datetime.utcnow(),
        "updatedAt":         datetime.utcnow(),
    }

    db = get_db()
    if db is not None:
        await db.tickets.insert_one(ticket)

    return ticket


async def check_human_response(ticket_id: str):
    path = os.path.join(HR_DIR, f"{ticket_id}_response.json")
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    db = get_db()
    if db:
        t = await db.tickets.find_one({"ticketId": ticket_id})
        if t and t.get("adminResponse"):
            return {"ticketId": ticket_id, "response": {"finalResponse": t["adminResponse"]}}
    return None


async def get_user_tickets(user_id, limit=20):
    db = get_db()
    if not db: return []
    cursor = db.tickets.find({"userId": user_id}, sort=[("createdAt", -1)], limit=limit)
    return [_s(t) async for t in cursor]


async def get_by_id(ticket_id):
    db = get_db()
    if not db: return None
    t = await db.tickets.find_one({"ticketId": ticket_id})
    return _s(t) if t else None


async def log_interaction(data):
    db = get_db()
    if db:
        await db.assistant_logs.insert_one({**data, "loggedAt": datetime.utcnow()})


def _s(t):
    if t:
        t["_id"] = str(t["_id"])
        for k in ("createdAt", "updatedAt", "resolvedAt"):
            if isinstance(t.get(k), datetime):
                t[k] = t[k].isoformat()
    return t
