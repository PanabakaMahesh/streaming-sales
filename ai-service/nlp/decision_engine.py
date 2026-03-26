"""
nlp/decision_engine.py
Hybrid pipeline orchestration:

  1. Rule Engine first (greeting, how-to flows, menu) — instant, no ML
  2. Intent flags (sensitive, product dispute, payment)
  3. NLP classification (TF-IDF + Logistic Regression)
  4. Response engine (build solution or escalation)
  5. Return structured response (Step 11 format)
"""

from nlp.rule_engine import check_rule, MAIN_MENU
from nlp.intent_classifier import analyze
from nlp.preprocessing import preprocess, extract_keywords
from nlp.vectorizer import load, transform, top_features
from nlp.ticket_classifier import classify, load_classifier, load_label_encoder
from nlp.response_engine import build_response, build_fallback_response

_v = _clf = _le = None


def _load():
    global _v, _clf, _le
    if _v is None:
        _v = load()
        _clf = load_classifier()
        _le = load_label_encoder()


def process(text: str, user_id: str = "guest") -> dict:
    """
    Full hybrid processing pipeline.

    Returns Step 11 standard format:
    {
        type         : flow | menu | ai_response | human_escalation | goodbye | fallback
        message      : str
        menu         : list   (ALWAYS present — Step 1 persistent menu)
        showMenu     : bool   (ALWAYS true)
        ticketId     : str | None
        confidence   : float | None
        classification: dict | None
        explainability: dict | None
        routing      : dict | None
        should_save  : bool
        matched_rule : str | None
    }
    """
    # ── Step 1: Rule engine check ──────────────────────────────────────────
    rule_result = check_rule(text)
    if rule_result is not None:
        # Rule matched — return immediately with menu
        return {
            **rule_result,
            "menu": MAIN_MENU,
            "showMenu": True,
            "ticketId": None,
            "confidence": None,
            "classification": None,
            "explainability": None,
            "routing": None,
            "should_save": rule_result.get("should_save_ticket", False),
        }

    # ── Step 2: Intent flag analysis ───────────────────────────────────────
    intent_flags = analyze(text)

    # ── Step 3: NLP classification ─────────────────────────────────────────
    try:
        _load()
        processed = preprocess(text)
        keywords = extract_keywords(text)
        fv = transform([processed], _v)
        tfidf_kws = top_features(processed, _v)
        classification = classify(fv, _clf, _le)
    except Exception as e:
        # Model not ready — show fallback with menu
        fb = build_fallback_response()
        return {**fb, "ticketId": None, "confidence": None,
                "classification": None, "explainability": None,
                "routing": None, "should_save": False}

    # ── Step 4: Build response via response engine ─────────────────────────
    response_data = build_response(
        category=classification["predicted_category"],
        confidence=classification["confidence"],
        keywords=tfidf_kws or keywords,
        intent_flags=intent_flags,
    )

    explainability = {
        "predicted_category": classification["predicted_label"],
        "confidence_score": f"{classification['confidence']:.0%}",
        "important_words": tfidf_kws or keywords,
        "explanation": response_data.get("reason", response_data.get("confidence_note", "")),
        "priority": response_data.get("priority", "LOW"),
        "all_scores": classification.get("all_scores", {}),
    }

    # ── Step 5: Build final structured response ────────────────────────────
    return {
        "type": response_data["type"],
        "message": response_data.get("message"),  # filled with ticket ID later if escalation
        "menu": MAIN_MENU,
        "showMenu": True,
        "ticketId": None,   # filled after ticket is saved
        "confidence": classification["confidence"],
        "classification": classification,
        "explainability": explainability,
        "routing": response_data,
        "should_save": True,
        "matched_rule": None,
    }
