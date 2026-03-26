"""
nlp/response_engine.py — Steps 8 & 9
Maps every category to a specific, guided response with steps.
No single default response is ever used.
Escalation only when confidence < 0.60 OR sensitive/payment/product dispute.
"""

from nlp.rule_engine import MAIN_MENU

# ── Escalation threshold (Step 9) ────────────────────────────────────────────
# Escalate ONLY if confidence < 0.60 OR forced by sensitive/payment/dispute flags
ESCALATION_THRESHOLD = 0.60


# ── Category response map ─────────────────────────────────────────────────────
RESPONSES = {
    "login_issue": {
        "title": "🔐 Login Issue",
        "intro": "I can help you fix your login problem right away!",
        "steps": [
            "Go to the **Login page** and click **'Forgot Password'**",
            "Enter your registered **email address**",
            "Check your **inbox AND spam folder** for the reset link",
            "Click the link — it expires in **15 minutes**",
            "Set a new strong password (min. 8 characters)",
            "Try logging in again with your new password ✅",
        ],
        "tip": "Still stuck? Clear your browser cache (Ctrl+Shift+Delete) and try again in a different browser.",
        "quick_actions": ["🔐 Login Issue", "👤 Account Problem"],
    },
    "order_issue": {
        "title": "📦 Order Problem",
        "intro": "Let me help you resolve your order issue!",
        "steps": [
            "Go to **Buyer Dashboard → Orders** to check current status",
            "🔵 **Placed** → Awaiting seller confirmation (1–2 days)",
            "🟡 **Processing** → Seller is preparing your order",
            "🟣 **Shipped** → On the way — check tracking details",
            "🟢 **Delivered** → Should have arrived",
            "If status hasn't changed in **3+ days** → raise a ticket below",
        ],
        "tip": "Keep your Order ID ready. For wrong/damaged items, take photos immediately.",
        "quick_actions": ["📦 Order Problem", "🎫 Raise Ticket"],
    },
    "seller_issue": {
        "title": "🏪 Seller Dashboard Issue",
        "intro": "I'll help you get your seller account working!",
        "steps": [
            "Go to **Seller Dashboard** and check for any warning banners",
            "For **product listing issues** → clear the form and resubmit",
            "For **image upload issues** → ensure image is under 5MB (JPG/PNG)",
            "For **dashboard loading** → press **Ctrl+Shift+R** for hard refresh",
            "For **stream issues** → check mic/camera permissions in browser",
            "Ensure your **seller profile is 100% complete**",
        ],
        "tip": "If your account was suspended, raise a ticket for human review.",
        "quick_actions": ["🏪 Seller Dashboard", "🎫 Raise Ticket"],
    },
    "account_issue": {
        "title": "👤 Account Problem",
        "intro": "Let me help you fix your account!",
        "steps": [
            "Go to **top navigation → your avatar → Edit Profile**",
            "Update your name, email or phone and click **Save**",
            "For **email change** → a verification link goes to the new email",
            "For **security concerns** → go to Settings → Change Password immediately",
            "For **notifications** → go to Settings → Notification Preferences",
            "For **account deletion** → contact support (processed manually)",
        ],
        "tip": "If you think your account was compromised, reset your password immediately.",
        "quick_actions": ["👤 Account Problem", "🔐 Login Issue"],
    },
    "technical_bug": {
        "title": "🐛 Technical Bug",
        "intro": "Sorry about the technical issue! Here's what to try:",
        "steps": [
            "**Refresh** the page — press F5 or Ctrl+R",
            "**Clear browser cache** — Ctrl+Shift+Delete → select 'All time'",
            "Try a **different browser** (Chrome, Firefox, Edge)",
            "**Disable browser extensions** — they often interfere",
            "Try switching between **mobile and desktop** version",
            "Note the **exact error message** shown on screen",
        ],
        "tip": "If the bug persists, raise a ticket and include a screenshot.",
        "quick_actions": ["🐛 Technical Bug", "🎫 Raise Ticket"],
    },
    "product_issue": {
        "title": "📦 Product Issue",
        "intro": "I'm sorry to hear about the product issue. This needs immediate attention!",
        "steps": [
            "**Take clear photos** of the product and packaging immediately",
            "Go to **Orders → your order → Contact Seller**",
            "Describe the issue clearly and attach your photos",
            "Wait up to **24 hours** for the seller to respond",
            "If seller doesn't respond → your case is **escalated to our team**",
            "We will resolve with a **refund or replacement**",
        ],
        "tip": "Product disputes are HIGH priority — our team handles these within 24 hours.",
        "quick_actions": ["🎫 Raise Ticket", "👨‍💼 Human Support"],
    },
    "general_query": {
        "title": "💬 General Information",
        "intro": "Happy to help! Here's what you need to know:",
        "steps": [
            "**Browse** → All products at /products — no account needed",
            "**Buy** → Register as Buyer → add to cart → checkout",
            "**Sell** → Register as Seller → list products → go live",
            "**Track Orders** → Buyer Dashboard → Orders",
            "**Support** → Use this AI assistant or raise a ticket anytime",
            "**Live Streams** → Watch at /streams or start one from Seller Dashboard",
        ],
        "tip": "Type your question and I'll do my best to answer it directly!",
        "quick_actions": ["💬 General Question", "🎫 Raise Ticket"],
    },
}


def build_response(category: str, confidence: float, keywords: list, intent_flags: dict) -> dict:
    """
    Builds the full structured response for an NLP-classified message.

    Step 9 escalation logic:
      - Force escalate: sensitive, product dispute, payment issue
      - Escalate if: confidence < ESCALATION_THRESHOLD (0.60)
      - Otherwise: return AI solution WITH menu
    """
    force = intent_flags.get("force_escalate", False)

    # ── Escalation decision ────────────────────────────────────────
    if force or confidence < ESCALATION_THRESHOLD:
        priority = "HIGH" if force else "HIGH" if confidence < 0.40 else "MEDIUM"
        reason = _escalation_reason(intent_flags, confidence)
        return {
            "action": "escalate",
            "type": "human_escalation",
            "priority": priority,
            "reason": reason,
            "requires_human": True,
            "save_to_folder": True,
            "is_seller_escalation": intent_flags.get("is_product_dispute", False),
        }

    # ── AI can handle ──────────────────────────────────────────────
    sol = RESPONSES.get(category, RESPONSES["general_query"])
    steps_text = "\n".join(f"**Step {i+1}** — {s}" for i, s in enumerate(sol["steps"]))

    message = (
        f"{sol['intro']}\n\n"
        f"{steps_text}\n\n"
        f"💡 **Tip:** {sol['tip']}"
    )

    return {
        "action": "auto_resolve",
        "type": "ai_response",
        "title": sol["title"],
        "message": message,
        "steps": sol["steps"],
        "tip": sol["tip"],
        "priority": "LOW",
        "requires_human": False,
        "save_to_folder": False,
        "confidence_note": f"Resolved with {confidence:.0%} confidence",
        "keywords_detected": keywords,
    }


def build_escalation_message(ticket_id: str, priority: str, category: str) -> str:
    priority_line = {
        "HIGH": "🚨 This has been marked as **high priority** and escalated immediately.",
        "MEDIUM": "Our support team will review your case shortly.",
    }.get(priority, "A support agent will assist you soon.")

    cat_label = RESPONSES.get(category, {}).get("title", "your issue")

    return (
        f"I'm forwarding your **{cat_label}** to our human support team. 👨‍💼\n\n"
        f"{priority_line}\n\n"
        f"🎫 Your Ticket ID: **{ticket_id}**\n"
        f"📍 Track it in: **Buyer Dashboard → My Tickets**\n\n"
        f"You can click **'🔍 Check if Agent Replied'** below to get updates."
    )


def build_fallback_response() -> dict:
    """Step 6: Improved fallback — never a generic default."""
    return {
        "type": "fallback",
        "message": (
            "I didn't quite understand that. 🤔\n\n"
            "Could you choose an option from the menu below, or rephrase your question?\n\n"
            "I'm here to help! 👇"
        ),
        "menu": MAIN_MENU,
        "showMenu": True,
        "should_save_ticket": False,
    }


def _escalation_reason(flags: dict, conf: float) -> str:
    if flags.get("is_product_dispute"):
        return "Product dispute detected — always escalated to human support."
    if flags.get("is_sensitive"):
        return "Sensitive issue detected — always escalated to human support."
    if flags.get("is_payment_issue"):
        return "Payment issue detected — always escalated to human support."
    return f"AI confidence too low ({conf:.0%}) — human review required."
