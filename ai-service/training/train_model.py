"""
training/train_model.py
Trains ticket classifier. Greetings and flow_requests handled by rule engine.
Run: python training/train_model.py
"""
import os, sys
import pandas as pd, joblib
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from nlp.preprocessing import preprocess
from nlp.vectorizer import fit_save, transform as vt

DATA = os.path.join(os.path.dirname(__file__), "..", "data", "training_data.csv")
MDIR = os.path.join(os.path.dirname(__file__), "..", "models")


def train():
    print("=" * 62)
    print("  StreamSales AI v4 — Hybrid Classifier Training")
    print("=" * 62)

    df = pd.read_csv(DATA)
    print(f"\n📂 Total rows loaded: {len(df)}")

    # Filter: only support_request, bug_report, complaint, general_question
    # Greetings, goodbyes, flow_requests are handled by rule engine
    support_df = df[~df["intent"].isin(["greeting", "goodbye", "flow_request"])].copy()
    support_df = support_df[support_df["category"] != "none"].dropna(subset=["text","category"])
    print(f"   Support rows (after filtering rule-based): {len(support_df)}")
    print(f"\n   Category distribution:\n{support_df['category'].value_counts().to_string()}")

    print("\n🔧 Preprocessing text...")
    support_df["processed"] = support_df["text"].apply(preprocess)

    le = LabelEncoder()
    y = le.fit_transform(support_df["category"])
    print(f"   Classes: {list(le.classes_)}")

    print("\n📊 Building TF-IDF features...")
    v = fit_save(support_df["processed"].tolist())
    X = vt(support_df["processed"].tolist(), v)
    print(f"   Feature matrix: {X.shape}")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("\n🤖 Training Logistic Regression...")
    clf = LogisticRegression(max_iter=1000, C=1.5, multi_class="multinomial", solver="lbfgs", random_state=42)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n📈 Test Accuracy: {acc:.4f} ({acc:.1%})")
    print(classification_report(y_test, y_pred, target_names=le.classes_, zero_division=0))
    cv = cross_val_score(clf, X, y, cv=5, scoring="accuracy")
    print(f"🔁 5-Fold CV: {cv.mean():.4f} ± {cv.std():.4f}")

    # Test rule engine
    print("\n🧪 Rule Engine Tests (these must NEVER reach ML classifier):")
    from nlp.rule_engine import check_rule
    tests = [
        ("hi", "greeting"),
        ("hi iam mahesh", "greeting"),
        ("good morning", "greeting"),
        ("how to buy a product", "how_to_buy"),
        ("how to order something", "how_to_buy"),
        ("how to become a seller", "how_to_sell"),
        ("how to track my order", "how_to_track"),
        ("main menu", "main_menu"),
    ]
    all_ok = True
    for msg, expected_rule in tests:
        r = check_rule(msg)
        ok = r is not None
        if not ok: all_ok = False
        print(f"   \"{msg}\" → {'✅ Rule caught' if ok else '❌ MISSED — went to NLP'}")

    print(f"\n{'✅ All rule engine tests passed!' if all_ok else '⚠️  Some tests failed'}")

    os.makedirs(MDIR, exist_ok=True)
    joblib.dump(clf, os.path.join(MDIR, "ticket_classifier.joblib"))
    joblib.dump(le, os.path.join(MDIR, "label_encoder.joblib"))
    print(f"\n✅ Models saved to {MDIR}/")
    print(f"\n🎉 Done! Start with: uvicorn main:app --reload --port 8000")
    print("=" * 62)


if __name__ == "__main__":
    train()
