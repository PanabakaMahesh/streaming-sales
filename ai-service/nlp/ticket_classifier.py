"""nlp/ticket_classifier.py — ML model wrapper."""
import os, joblib, numpy as np

MDIR = os.path.join(os.path.dirname(__file__), "..", "models")
LABELS = {
    "login_issue":   "Login Issue",
    "order_issue":   "Order Issue",
    "seller_issue":  "Seller Issue",
    "account_issue": "Account Issue",
    "technical_bug": "Technical Bug",
    "product_issue": "Product Issue",
    "general_query": "General Query",
}


def load_classifier():
    p = os.path.join(MDIR, "ticket_classifier.joblib")
    if not os.path.exists(p):
        raise FileNotFoundError("Classifier not found. Run: python training/train_model.py")
    return joblib.load(p)


def load_label_encoder():
    p = os.path.join(MDIR, "label_encoder.joblib")
    if not os.path.exists(p):
        raise FileNotFoundError("Label encoder not found.")
    return joblib.load(p)


def classify(fv, clf, le) -> dict:
    probs = clf.predict_proba(fv)[0]
    classes = le.classes_
    idx = int(np.argmax(probs))
    cat = classes[idx]
    conf = float(probs[idx])
    return {
        "predicted_category": cat,
        "predicted_label": LABELS.get(cat, cat),
        "confidence": round(conf, 4),
        "all_scores": {LABELS.get(c, c): round(float(p), 4) for c, p in zip(classes, probs)},
    }
