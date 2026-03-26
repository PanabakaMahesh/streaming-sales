"""
nlp/intent_classifier.py
Detects intent for messages that passed the rule engine.
Only runs on messages that need NLP classification.
"""

SENSITIVE_KEYWORDS = [
    "refund", "fraud", "scam", "hacked", "stolen", "cheat", "cheated",
    "dispute", "damaged", "fake", "wrong item", "police", "legal",
    "lawsuit", "overcharged", "money missing", "counterfeit",
    "report fraud", "expired", "defective", "broken on arrival",
    "empty box", "payment failed money deducted",
]

PRODUCT_DISPUTE_KEYWORDS = [
    "wrong item", "wrong product", "damaged product", "product damaged",
    "not matching description", "fake product", "not as described",
    "broken item", "defective", "counterfeit", "received empty box",
    "item missing", "missing from package", "item looks used",
    "wrong color", "wrong size", "seller sent wrong", "seller cheated",
]

PAYMENT_KEYWORDS = [
    "payment failed", "money deducted", "charged twice", "double charge",
    "payment not processed", "upi failed", "card declined refund",
    "transaction failed money gone",
]


def analyze(text: str) -> dict:
    """
    Returns sensitivity flags for NLP-classified messages.
    These flags override confidence routing.
    """
    lower = text.lower()

    is_product_dispute = any(k in lower for k in PRODUCT_DISPUTE_KEYWORDS)
    is_sensitive = any(k in lower for k in SENSITIVE_KEYWORDS)
    is_payment_issue = any(k in lower for k in PAYMENT_KEYWORDS)

    force_escalate = is_product_dispute or is_sensitive or is_payment_issue

    return {
        "is_sensitive": is_sensitive,
        "is_product_dispute": is_product_dispute,
        "is_payment_issue": is_payment_issue,
        "force_escalate": force_escalate,
    }
