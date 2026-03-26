"""nlp/vectorizer.py — TF-IDF vectorization."""
import os, joblib
from sklearn.feature_extraction.text import TfidfVectorizer

MDIR = os.path.join(os.path.dirname(__file__), "..", "models")
VPATH = os.path.join(MDIR, "tfidf_vectorizer.joblib")


def build():
    return TfidfVectorizer(max_features=6000, ngram_range=(1,2), min_df=1, max_df=0.90, sublinear_tf=True)

def fit_save(texts):
    v = build(); v.fit(texts)
    os.makedirs(MDIR, exist_ok=True)
    joblib.dump(v, VPATH)
    print(f"  ✅ Vectorizer saved")
    return v

def load():
    if not os.path.exists(VPATH):
        raise FileNotFoundError("Vectorizer not found. Run: python training/train_model.py")
    return joblib.load(VPATH)

def transform(texts, v): return v.transform(texts)

def top_features(text, v, n=5):
    vec = v.transform([text])
    names = v.get_feature_names_out()
    scores = vec.toarray()[0]
    idx = scores.argsort()[::-1][:n]
    return [names[i] for i in idx if scores[i] > 0]
