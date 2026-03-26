# AI Service v4 — Setup & Run Guide
# Hybrid Rule-based + NLP Conversational System

=============================================================
  WHAT'S NEW IN v4
=============================================================

  ✅ Menu shown after EVERY bot message (persistent)
  ✅ 🏠 Main Menu button always visible
  ✅ "how to buy", "how to order" → guided steps (no escalation)
  ✅ "how to sell", "go live" → guided steps (no escalation)
  ✅ "how to track order" → guided steps (no escalation)
  ✅ Greetings → welcome + menu (no ticket)
  ✅ Escalation ONLY if confidence < 0.60 or sensitive/payment
  ✅ Fallback: "I didn't understand — choose from menu"
  ✅ 300+ training examples (was 200 in v3)
  ✅ Colour-coded message types (flow/ai_response/escalation)
  ✅ "Check if Agent Replied" button on escalated tickets


=============================================================
  STEP 1 — REPLACE FILES
=============================================================

  1. Empty your existing ai-service/ folder
     (keep the folder itself, just delete everything inside)

  2. Copy all files from ai-service-v4/ into ai-service/

  3. Replace AssistantWidget.jsx:
     FROM: AssistantWidget.jsx (in this zip)
     TO:   frontend/src/components/assistant/AssistantWidget.jsx


=============================================================
  STEP 2 — OPEN TERMINAL IN VS CODE
=============================================================

  Press:  Ctrl + `   (backtick key)


=============================================================
  STEP 3 — GO TO AI SERVICE FOLDER
=============================================================

  cd ai-service


=============================================================
  STEP 4 — ACTIVATE VIRTUAL ENVIRONMENT
=============================================================

  Windows:
    venv\Scripts\activate

  Mac/Linux:
    source venv/bin/activate

  If venv doesn't exist yet:
    python -m venv venv
    (then activate as above)

  You should see (venv) at start of the terminal line.


=============================================================
  STEP 5 — INSTALL PACKAGES
=============================================================

  pip install -r requirements.txt

  Wait until it finishes completely.


=============================================================
  STEP 6 — CREATE .ENV FILE
=============================================================

  Windows:
    copy .env.example .env

  Mac/Linux:
    cp .env.example .env

  Open .env and confirm:
    MONGODB_URI=mongodb://localhost:27017/streaming-sales
    SUPPORT_SECRET=support-secret-change-this


=============================================================
  STEP 7 — TRAIN THE MODEL (REQUIRED)
=============================================================

  python training/train_model.py

  Wait for it to finish. You should see:

  ============================================================
    StreamSales AI v4 — Hybrid Classifier Training
  ============================================================
  📂 Total rows loaded: 300+
  🧪 Rule Engine Tests:
     "hi" → ✅ Rule caught
     "hi iam mahesh" → ✅ Rule caught
     "how to buy a product" → ✅ Rule caught
     "how to order something" → ✅ Rule caught
     "how to become a seller" → ✅ Rule caught
     "how to track my order" → ✅ Rule caught
     "main menu" → ✅ Rule caught

  ✅ All rule engine tests passed!
  🎉 Done!

  If you see all ✅, everything is working correctly.


=============================================================
  STEP 8 — START THE AI SERVICE
=============================================================

  uvicorn main:app --reload --port 8000

  You should see:
    ✅ AI models loaded successfully
    ✅ AI Service v4 connected to MongoDB
    Uvicorn running on http://127.0.0.1:8000

  Test it: open http://localhost:8000/health
  Should show: {"status":"ok","service":"StreamSales AI v4"}


=============================================================
  STEP 9 — START EVERYTHING ELSE (SEPARATE TERMINALS)
=============================================================

  Open new terminals for each:

  Terminal 2 — MongoDB:
    mongod

  Terminal 3 — Node.js Backend:
    cd backend
    npm run dev

  Terminal 4 — React Frontend:
    cd frontend
    npm start


=============================================================
  STEP 10 — TEST IN BROWSER
=============================================================

  Open: http://localhost:3000
  Click the 🤖 button (bottom-right corner)

  ── Test 1: Greetings (must show menu, NO ticket) ──

    Type: "hi"              → Welcome menu ✅
    Type: "hi iam mahesh"   → Welcome + name ✅
    Type: "hello"           → Welcome menu ✅
    Type: "good morning"    → Welcome menu ✅

  ── Test 2: How-to flows (guided steps, NO escalation) ──

    Type: "how to buy a product"    → 8-step buying guide ✅
    Type: "how to order something"  → Buying guide ✅
    Type: "how to become a seller"  → Selling guide ✅
    Type: "how to track my order"   → Tracking guide ✅
    Click: "🏠 Main Menu" button    → Shows menu ✅

  ── Test 3: Support issues (NLP classification) ──

    Type: "I cannot login"      → Login Issue + steps ✅
    Type: "my order is late"    → Order Issue + steps ✅
    Type: "dashboard not loading" → Seller/Tech Issue ✅

  ── Test 4: Sensitive issues (escalation) ──

    Type: "I need a refund"         → Human escalation ✅
    Type: "product was damaged"     → Human escalation ✅
    Type: "payment failed"          → Human escalation ✅
    Check: ai-service/human_support/incoming_queries/
           → JSON file should appear ✅

  ── Test 5: Persistent menu ──

    After EVERY bot response:
    → Menu buttons always visible ✅
    → 🏠 Main Menu button always visible ✅


=============================================================
  HOW THE HYBRID PIPELINE WORKS
=============================================================

  User types message
         │
         ▼
  ┌─────────────────────┐
  │   RULE ENGINE       │  ← runs first (instant, no ML)
  │  check_rule(text)   │
  └─────────────────────┘
         │
    Rule matched?
    YES ──────────────────→ Return guided response + menu
                            (greetings, how-to flows, main menu)
         │ NO
         ▼
  ┌─────────────────────┐
  │  INTENT ANALYZER    │  ← check sensitive flags
  │  analyze(text)      │
  └─────────────────────┘
         │
    Force escalate?  (sensitive / product dispute / payment)
    YES ──────────────────→ Save to human_support/ + return escalation
         │ NO
         ▼
  ┌─────────────────────┐
  │  NLP CLASSIFIER     │  ← TF-IDF + Logistic Regression
  │  classify(text)     │
  └─────────────────────┘
         │
    confidence >= 0.60?
    YES ──────────────────→ Return AI solution + menu
         │ NO (< 0.60)
         ▼
    Save to human_support/incoming_queries/
    Return escalation message + menu


=============================================================
  RESPONSE TYPES (colour-coded in chat)
=============================================================

  🟢 ai_response     → Green border — AI solved it
  🔵 flow            → Blue border  — Step-by-step guide
  🟡 human_escalation → Yellow border — Forwarded to human
  ⬜ menu            → Default — Menu shown


=============================================================
  HUMAN SUPPORT FOLDER USAGE
=============================================================

  Escalated tickets saved to:
    ai-service/human_support/incoming_queries/TKT-XXXXXX.json

  To respond to a buyer:
  Create file at:
    ai-service/human_support/human_responses/TKT-XXXXXX_response.json

  With content:
  {
    "ticketId": "TKT-XXXXXX",
    "response": {
      "finalResponse": "Your response to the buyer here"
    },
    "savedAt": "2024-01-01T00:00:00"
  }

  Buyer clicks "🔍 Check if Agent Replied" → sees your response.


=============================================================
  TROUBLESHOOTING
=============================================================

  Error: "Models not found"
  Fix: python training/train_model.py

  Error: CORS error in browser
  Fix: Add to frontend/.env:
       REACT_APP_AI_SERVICE_URL=http://localhost:8000
       Then restart: npm start

  Error: MongoDB connection failed
  Fix: Open new terminal and run: mongod

  Error: Port 8000 already in use
  Fix: uvicorn main:app --reload --port 8001
       Update frontend/.env:
       REACT_APP_AI_SERVICE_URL=http://localhost:8001

  Error: venv\Scripts\activate not recognized (Windows)
  Fix: Run this first:
       Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
       Then try again.

  Error: NLTK data missing
  Fix: python -c "import nltk; nltk.download('all')"
       Then retrain.


=============================================================
  QUICK REFERENCE — ALL TERMINAL COMMANDS
=============================================================

  cd ai-service
  venv\Scripts\activate
  pip install -r requirements.txt
  copy .env.example .env
  python training/train_model.py
  uvicorn main:app --reload --port 8000
