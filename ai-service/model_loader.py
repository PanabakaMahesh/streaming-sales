"""model_loader.py"""
import os, joblib
_clf = _v = _le = None
MDIR = os.path.join(os.path.dirname(__file__), "models")

def load_all():
    global _clf, _v, _le
    ps = {k: os.path.join(MDIR, f) for k, f in [("clf","ticket_classifier.joblib"),("vec","tfidf_vectorizer.joblib"),("le","label_encoder.joblib")]}
    if not all(os.path.exists(p) for p in ps.values()):
        raise RuntimeError("Models not found. Run: python training/train_model.py")
    _clf = joblib.load(ps["clf"]); _v = joblib.load(ps["vec"]); _le = joblib.load(ps["le"])
    print("✅ AI models loaded successfully")

def get_classifier():
    if _clf is None: load_all()
    return _clf

def get_vectorizer():
    if _v is None: load_all()
    return _v

def get_label_encoder():
    if _le is None: load_all()
    return _le
