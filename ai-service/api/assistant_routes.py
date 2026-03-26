"""
api/assistant_routes.py
FastAPI endpoints — every response includes persistent menu (Step 1, 10, 11).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from nlp.decision_engine import process
from nlp.rule_engine import MAIN_MENU
from nlp.response_engine import build_response, build_escalation_message, build_fallback_response
from support.ticket_manager import create_ticket, get_user_tickets, get_by_id, check_human_response, log_interaction
from support.human_support_router import save_incoming, forward_to_seller
from database import get_db

router = APIRouter()


class MessageReq(BaseModel):
    message: str
    userId: Optional[str] = "guest"
    sessionId: Optional[str] = None


class MenuReq(BaseModel):
    category: str
    userId: Optional[str] = "guest"


class CheckReq(BaseModel):
    ticketId: str
    userId: Optional[str] = "guest"


# ── Step 2: Global menu endpoint ──────────────────────────────────────────────
@router.get("/menu")
def get_menu():
    """Always returns the main menu — Step 2 global menu handler."""
    return {
        "type": "menu",
        "message": "Hello! 👋 Welcome to **StreamSales AI Support**.\n\nHow can I assist you today?",
        "menu": MAIN_MENU,
        "showMenu": True,
        "ticketId": None,
        "confidence": None,
    }


@router.get("/status")
def status():
    return {"status": "ok", "version": "v4", "service": "StreamSales AI v4 (Hybrid)"}


@router.post("/message")
async def handle_message(req: MessageReq):
    """
    Main chat endpoint — full hybrid pipeline.
    Every response includes menu + showMenu: true.
    """
    if not req.message or not req.message.strip():
        return {**get_menu(), "showMenu": True}

    # Run hybrid pipeline
    result = process(req.message, req.userId)

    # Rule-matched — return immediately (no ticket)
    if not result.get("should_save", False):
        return {
            "type": result.get("type", "menu"),
            "message": result.get("message", ""),
            "menu": MAIN_MENU,
            "showMenu": True,
            "ticketId": None,
            "confidence": None,
            "ticket_created": False,
            "matched_rule": result.get("matched_rule"),
        }

    # Save ticket
    ticket = await create_ticket(req.message, req.userId, result, req.sessionId)
    ticket_id = ticket["ticketId"]
    routing = result.get("routing") or {}

    # Save to human_support folder if needed
    if routing.get("save_to_folder", False):
        save_incoming(ticket)
        if routing.get("is_seller_escalation", False):
            forward_to_seller(ticket, seller_id="pending_assignment")

    # Step 12: Log
    await log_interaction({
        "userId": req.userId,
        "userMessage": req.message,
        "predictedCategory": result.get("classification", {}).get("predicted_category"),
        "confidence": result.get("confidence"),
        "actionTaken": routing.get("action"),
        "ticketId": ticket_id,
        "type": result.get("type"),
    })

    # Build final response
    if result["type"] == "ai_response":
        return {
            "type": "ai_response",
            "message": result.get("message", ""),
            "menu": MAIN_MENU,
            "showMenu": True,
            "ticketId": ticket_id,
            "confidence": result.get("confidence"),
            "ticket_created": True,
            "status": ticket["status"],
            "explainability": result.get("explainability"),
            "routing": routing,
        }
    else:
        esc_msg = build_escalation_message(
            ticket_id,
            routing.get("priority", "MEDIUM"),
            result.get("classification", {}).get("predicted_category", "general_query"),
        )
        return {
            "type": "human_escalation",
            "message": esc_msg,
            "menu": MAIN_MENU,
            "showMenu": True,
            "ticketId": ticket_id,
            "confidence": result.get("confidence"),
            "ticket_created": True,
            "status": ticket["status"],
            "explainability": result.get("explainability"),
            "routing": routing,
        }


@router.post("/quick-resolve")
async def quick_resolve(req: MenuReq):
    """
    Menu button handler — skips NLP, uses category directly.
    Always returns solution + persistent menu.
    """
    if req.category in ("human", "raise_ticket", "new_ticket"):
        return {
            "type": "human_escalation",
            "message": "A human support agent will assist you shortly. 👨‍💼\n\nPlease describe your issue in detail below so we can help faster:",
            "menu": MAIN_MENU,
            "showMenu": True,
            "ticketId": None,
            "ticket_created": False,
        }

    sol = build_response(req.category, 0.99, [], {"force_escalate": False})
    fake_clf = {
        "predicted_category": req.category,
        "predicted_label": req.category.replace("_", " ").title(),
        "confidence": 0.99, "all_scores": {},
    }
    ticket = await create_ticket(
        f"[Menu] {req.category}", req.userId,
        {
            "type": "ai_response",
            "message": sol.get("message", ""),
            "classification": fake_clf,
            "routing": {"requires_human": False, "save_to_folder": False,
                        "priority": "LOW", "action": "auto_resolve"},
            "explainability": {},
        },
    )
    return {
        "type": "ai_response",
        "message": sol.get("message", ""),
        "menu": MAIN_MENU,
        "showMenu": True,
        "ticketId": ticket["ticketId"],
        "confidence": 0.99,
        "ticket_created": True,
        "status": "Auto Resolved",
    }


@router.post("/check-response")
async def check_response(req: CheckReq):
    """Step 8: Check if human agent has responded to ticket."""
    resp = await check_human_response(req.ticketId)
    if resp:
        agent_text = resp.get("response", {}).get("finalResponse", "")
        return {
            "type": "human_response",
            "message": f"👨‍💼 **Our support agent has responded:**\n\n{agent_text}",
            "menu": MAIN_MENU,
            "showMenu": True,
            "ticketId": req.ticketId,
            "has_response": True,
        }
    return {
        "type": "waiting",
        "message": f"Your ticket **{req.ticketId}** is still being reviewed.\n\nWe'll update you as soon as possible. Thank you for your patience! 🙏",
        "menu": MAIN_MENU,
        "showMenu": True,
        "ticketId": req.ticketId,
        "has_response": False,
    }


@router.get("/tickets/user/{user_id}")
async def user_tickets(user_id: str, limit: int = 20):
    tickets = await get_user_tickets(user_id, limit)
    return {"tickets": tickets, "total": len(tickets)}


@router.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    t = await get_by_id(ticket_id)
    if not t: raise HTTPException(status_code=404, detail="Ticket not found.")
    return {"ticket": t}
