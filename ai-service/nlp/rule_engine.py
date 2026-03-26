"""
nlp/rule_engine.py — Steps 3, 4, 5
Rule-based engine that intercepts high-confidence patterns
BEFORE the NLP classifier runs.

Rules never escalate to human support.
Rules always return guided step-by-step flows.
Only the NLP classifier can trigger escalation.
"""

import re

# ── Main menu definition (Step 1) ─────────────────────────────────────────────
MAIN_MENU = [
    {"id": "login_issue",   "label": "🔐 Login Issue"},
    {"id": "order_issue",   "label": "📦 Order Problem"},
    {"id": "seller_issue",  "label": "🏪 Seller Dashboard"},
    {"id": "account_issue", "label": "👤 Account Problem"},
    {"id": "technical_bug", "label": "🐛 Technical Bug"},
    {"id": "product_issue", "label": "📦 Product Issue"},
    {"id": "general_query", "label": "💬 General Question"},
    {"id": "raise_ticket",  "label": "🎫 Raise Ticket"},
    {"id": "human",         "label": "👨‍💼 Human Support"},
]

# ── Greeting patterns ─────────────────────────────────────────────────────────
GREETING_PATTERNS = [
    r"^(hi|hello|hey|hii|helo|heey|hiii)\b",
    r"^good\s*(morning|evening|afternoon|night|day)\b",
    r"^(hi|hello|hey)\s+(there|everyone|all|support|team)\b",
    r"^(hi|hello|hey|hii)\s+i\s+(am|m|im)\b",
    r"^(hi|hello|hey)\s+my\s+name\s+is\b",
    r"^(i\s*am|i'?m|my\s+name\s+is)\s+\w+\s*$",
    r"^(hi|hello)\s+\w+\s*$",
    r"^(hi|hello|hey|hii)\s*[!.,]?\s*$",
    r"^(what'?s\s*up|sup|howdy|greetings|yo)\b",
]

GOODBYE_PATTERNS = [
    r"\b(bye|goodbye|see\s*you|cya|take\s*care)\b",
    r"\b(thanks?\s*(bye|goodbye)|ok\s*thanks?|thank\s*you\s*(bye|goodbye))\b",
    r"\b(that\s*helped|all\s*good\s*now|problem\s*solved|issue\s*resolved)\b",
    r"\b(i\s*am\s*done|all\s*set|great\s*thanks?)\b",
]

# ── How-to flow patterns — NEVER escalate these ───────────────────────────────
HOW_TO_BUY_PATTERNS = [
    r"\b(how\s+to\s+buy|how\s+to\s+order|how\s+to\s+purchase|how\s+to\s+checkout)\b",
    r"\b(buy\s+a?\s*product|order\s+(a\s*)?product|purchase\s+(a\s*)?product)\b",
    r"\b(i\s+want\s+to\s+(buy|order|purchase))\b",
    r"\b(how\s+do\s+i\s+(buy|order|purchase|add\s+to\s+cart))\b",
    r"\b(steps?\s+to\s+(buy|order|purchase)|ordering\s+(guide|process|steps?))\b",
    r"\b(buying\s+(process|guide|steps?)|purchase\s+(steps?|guide|process))\b",
    r"\b(how\s+to\s+place\s+(an?\s+)?order|how\s+to\s+complete\s+(a\s+)?purchase)\b",
]

HOW_TO_SELL_PATTERNS = [
    r"\b(how\s+to\s+(sell|become\s+a?\s*seller|start\s+selling|list\s+a?\s*product))\b",
    r"\b(selling\s+(guide|steps?|process)|seller\s+(guide|steps?|registration))\b",
    r"\b(how\s+do\s+i\s+(sell|become\s+a?\s*seller|list|go\s+live))\b",
    r"\b(how\s+to\s+(go\s+live|start\s+stream|set\s+up\s+(my\s+)?store))\b",
    r"\b(i\s+want\s+to\s+(sell|become\s+a?\s*seller|start\s+a?\s*store))\b",
]

HOW_TO_TRACK_PATTERNS = [
    r"\b(how\s+to\s+track|track\s+(my\s+)?order|order\s+tracking)\b",
    r"\b(how\s+to\s+(check\s+order\s+status|find\s+(my\s+)?order|see\s+(my\s+)?order))\b",
    r"\b(where\s+(is\s+my\s+order|to\s+find\s+(my\s+)?order|to\s+see\s+(my\s+)?order))\b",
    r"\b(delivery\s+status|shipment\s+tracking|order\s+history)\b",
]

MAIN_MENU_TRIGGERS = [
    r"^(main\s*menu|menu|go\s+back|back\s+to\s+menu|show\s+menu|home)\s*$",
    r"^(start\s+over|restart|beginning|options)\s*$",
]

# ── Sensitive keywords — ALWAYS escalate ──────────────────────────────────────
ALWAYS_ESCALATE = [
    "fraud", "scam", "hacked", "stolen", "cheat", "cheated",
    "counterfeit", "fake product", "wrong item", "damaged product",
    "empty box", "dispute", "lawsuit", "legal action", "police",
]

# ── Support keywords (messages that need NLP classification) ──────────────────
SUPPORT_KEYWORDS = {
    "login", "password", "signin", "account", "order", "delivery",
    "product", "seller", "buyer", "payment", "error", "bug", "issue",
    "problem", "help", "refund", "cancel", "deliver", "crash", "broken",
    "fail", "reset", "stream", "dashboard", "listing", "upload", "profile",
    "verification", "email", "shipment", "tracking", "cart", "checkout",
    "suspended", "locked", "banned", "not working", "not loading",
}


def _match(text: str, patterns: list) -> bool:
    t = text.lower().strip()
    return any(re.search(p, t) for p in patterns)


def _contains_any(text: str, words: list) -> bool:
    t = text.lower()
    return any(w in t for w in words)


def check_rule(text: str) -> dict | None:
    """
    Check if message matches a rule-based pattern.
    Returns a fully-formed response dict or None (let NLP handle it).

    Rules:
      - Greetings      → Welcome menu
      - Goodbyes       → Farewell
      - Main menu      → Show menu
      - How-to flows   → Guided steps (NEVER escalate)
      - Short messages → Welcome menu
    """
    raw = text.strip()
    lower = raw.lower()
    words = lower.split()

    # ── 1. Main menu trigger ──────────────────────────────────────
    if _match(lower, MAIN_MENU_TRIGGERS):
        return _menu_response(
            "Here's the main menu. How can I help you today? 👇"
        )

    # ── 2. Greeting ───────────────────────────────────────────────
    if _match(lower, GREETING_PATTERNS):
        name = _extract_name(words)
        greeting = f"Hello{', ' + name if name else ''}! 👋"
        return _menu_response(
            f"{greeting} Welcome to **StreamSales AI Support**.\n\nHow can I assist you today? Choose an option or type your issue:"
        )

    # ── 3. Very short message — no support keywords ───────────────
    if len(words) <= 2 and not any(w in SUPPORT_KEYWORDS for w in words):
        return _menu_response(
            "Hello! 👋 Welcome to **StreamSales AI Support**.\n\nHow can I help you today?"
        )

    # ── 4. Goodbye ────────────────────────────────────────────────
    if _match(lower, GOODBYE_PATTERNS):
        return {
            "type": "goodbye",
            "message": "Thank you for contacting StreamSales Support! 👋\n\nHave a great day! Come back anytime if you need help.",
            "menu": MAIN_MENU,
            "showMenu": True,
            "matched_rule": "goodbye",
            "should_save_ticket": False,
        }

    # ── 5. How to buy ─────────────────────────────────────────────
    if _match(lower, HOW_TO_BUY_PATTERNS):
        return {
            "type": "flow",
            "message": (
                "Sure! Here's how to buy a product on StreamSales 🛒\n\n"
                "**Step 1** — Go to the **Marketplace** (top navigation)\n"
                "**Step 2** — Browse products or use the search bar\n"
                "**Step 3** — Click on a product to view details\n"
                "**Step 4** — Click **'Buy Now'** or **'Add to Cart'**\n"
                "**Step 5** — Review your cart and click **'Proceed to Checkout'**\n"
                "**Step 6** — Enter your delivery address\n"
                "**Step 7** — Choose payment: **Cash on Delivery** or **UPI**\n"
                "**Step 8** — Click **'Confirm Order'** — Done! ✅\n\n"
                "You'll receive order confirmation and can track it from your dashboard."
            ),
            "menu": MAIN_MENU,
            "showMenu": True,
            "matched_rule": "how_to_buy",
            "should_save_ticket": False,
        }

    # ── 6. How to sell ────────────────────────────────────────────
    if _match(lower, HOW_TO_SELL_PATTERNS):
        return {
            "type": "flow",
            "message": (
                "Great! Here's how to start selling on StreamSales 🏪\n\n"
                "**Step 1** — Click **'Sign Up'** and choose **'Sell Products'**\n"
                "**Step 2** — Fill in your name, email and password\n"
                "**Step 3** — Your **Seller Store** is automatically created\n"
                "**Step 4** — Go to **Seller Dashboard → Products → Add Product**\n"
                "**Step 5** — Add product name, description, price and photos\n"
                "**Step 6** — Click **Save** — your product is now live in the marketplace!\n"
                "**Step 7** — To go live, go to **Seller Dashboard → Stream → Go Live**\n\n"
                "💡 Tip: Complete your seller profile for more visibility!"
            ),
            "menu": MAIN_MENU,
            "showMenu": True,
            "matched_rule": "how_to_sell",
            "should_save_ticket": False,
        }

    # ── 7. How to track order ─────────────────────────────────────
    if _match(lower, HOW_TO_TRACK_PATTERNS):
        return {
            "type": "flow",
            "message": (
                "Here's how to track your order 📦\n\n"
                "**Step 1** — Log in to your account\n"
                "**Step 2** — Click your avatar in the top navigation\n"
                "**Step 3** — Go to **Dashboard → Orders** (or click 'Orders' in nav)\n"
                "**Step 4** — Find your order in the list\n"
                "**Step 5** — Check the **status badge**:\n"
                "   • 🔵 **Placed** — Order confirmed, awaiting seller\n"
                "   • 🟡 **Processing** — Seller is preparing your order\n"
                "   • 🟣 **Shipped** — Order is on the way\n"
                "   • 🟢 **Delivered** — Order has arrived\n\n"
                "If your order hasn't updated in 3+ days, please raise a support ticket."
            ),
            "menu": MAIN_MENU,
            "showMenu": True,
            "matched_rule": "how_to_track",
            "should_save_ticket": False,
        }

    # ── 8. No rule matched → let NLP handle ──────────────────────
    return None


def is_always_escalate(text: str) -> bool:
    """Check if message contains keywords that always require human escalation."""
    return _contains_any(text.lower(), ALWAYS_ESCALATE)


def _extract_name(words: list) -> str | None:
    triggers = {"am", "im", "is", "name"}
    for i, w in enumerate(words):
        if w in triggers and i + 1 < len(words):
            name = words[i + 1]
            if name.isalpha() and name not in {"a", "an", "the", "i", "my", "here"}:
                return name.capitalize()
    return None


def _menu_response(message: str) -> dict:
    return {
        "type": "menu",
        "message": message,
        "menu": MAIN_MENU,
        "showMenu": True,
        "matched_rule": "greeting_or_menu",
        "should_save_ticket": False,
    }
