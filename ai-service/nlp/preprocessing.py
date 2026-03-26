"""nlp/preprocessing.py — Text cleaning pipeline."""
import re, string
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

def _dl():
    for p in ["stopwords","wordnet","punkt","omw-1.4"]:
        try: nltk.download(p, quiet=True)
        except: pass

_dl()
_lem = WordNetLemmatizer()
try: _STOPS = set(stopwords.words("english"))
except: _STOPS = set()
_KEEP = {"not","no","never","cannot","can't","won't","doesn't","isn't"}
STOP_WORDS = _STOPS - _KEEP


def clean(text: str) -> str:
    if not text: return ""
    text = text.lower().strip()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"\d+", " NUM ", text)
    text = text.translate(str.maketrans("","",string.punctuation))
    return re.sub(r"\s+", " ", text).strip()


def preprocess(text: str) -> str:
    tokens = clean(text).split()
    tokens = [t for t in tokens if t not in STOP_WORDS]
    tokens = [_lem.lemmatize(t) for t in tokens]
    return " ".join(tokens)


def extract_keywords(text: str, n: int = 5) -> list:
    tokens = clean(text).split()
    kws = [t for t in tokens if t not in STOP_WORDS and len(t) > 2]
    seen, out = set(), []
    for k in kws:
        if k not in seen:
            seen.add(k); out.append(k)
    return out[:n]
