"""support/human_support_router.py — Secure human_support folder management."""
import os, json, uuid
from datetime import datetime

BASE = os.path.join(os.path.dirname(__file__), "..", "human_support")
INCOMING = os.path.join(BASE, "incoming_queries")
RESPONSES = os.path.join(BASE, "human_responses")
SELLER_Q = os.path.join(BASE, "seller_forward_queue")

for d in [INCOMING, RESPONSES, SELLER_Q]:
    os.makedirs(d, exist_ok=True)


def save_incoming(ticket: dict) -> str:
    tid = ticket.get("ticketId", f"TKT-{uuid.uuid4().hex[:8].upper()}")
    path = os.path.join(INCOMING, f"{tid}.json")
    payload = {k: (v.isoformat() if isinstance(v, datetime) else v)
               for k, v in ticket.items() if k != "_id"}
    payload.update({"requiresHuman": True, "savedAt": datetime.utcnow().isoformat(), "reviewed": False})
    with open(path, "w") as f:
        json.dump(payload, f, indent=2, default=str)
    return path


def save_agent_response(ticket_id: str, response: dict) -> str:
    path = os.path.join(RESPONSES, f"{ticket_id}_response.json")
    with open(path, "w") as f:
        json.dump({"ticketId": ticket_id, "response": response, "savedAt": datetime.utcnow().isoformat()}, f, indent=2)
    return path


def forward_to_seller(ticket: dict, seller_id: str) -> str:
    tid = ticket.get("ticketId", "unknown")
    path = os.path.join(SELLER_Q, f"{tid}_seller.json")
    with open(path, "w") as f:
        json.dump({
            "ticketId": tid, "sellerId": seller_id,
            "buyerMessage": ticket.get("ticketText", ""),
            "category": ticket.get("predictedLabel", ""),
            "createdAt": datetime.utcnow().isoformat(), "status": "Forwarded to Seller",
        }, f, indent=2)
    return path


def list_incoming():
    tickets = []
    for fn in os.listdir(INCOMING):
        if fn.endswith(".json"):
            try:
                with open(os.path.join(INCOMING, fn)) as f:
                    tickets.append(json.load(f))
            except: pass
    return sorted(tickets, key=lambda t: t.get("savedAt", ""), reverse=True)


def mark_reviewed(ticket_id: str):
    path = os.path.join(INCOMING, f"{ticket_id}.json")
    if os.path.exists(path):
        with open(path) as f: data = json.load(f)
        data["reviewed"] = True
        data["reviewedAt"] = datetime.utcnow().isoformat()
        with open(path, "w") as f: json.dump(data, f, indent=2)


def get_counts() -> dict:
    all_t = list_incoming()
    return {
        "total": len(all_t),
        "unreviewed": sum(1 for t in all_t if not t.get("reviewed", False)),
        "reviewed": sum(1 for t in all_t if t.get("reviewed", False)),
        "seller_queue": len(os.listdir(SELLER_Q)),
    }
