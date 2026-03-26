# 🚀 Streaming Sales – AI-Powered E-Commerce Platform

Streaming Sales is a next-generation e-commerce platform designed to support both buyers and sellers with an integrated **AI-powered support assistant**, real-time interaction features, and a scalable backend architecture.

This platform combines traditional e-commerce functionality with **intelligent automation**, enabling faster support resolution and improved user experience.

---

## 🌟 Key Features

### 🛒 Buyer Features

* Browse and search products
* View product details
* Place orders (basic flow)
* Track queries via AI support system
* Raise support tickets

---

### 🏪 Seller Features

* Create seller account (separate from buyer)
* Add and manage products
* Sell products via platform
* Receive escalated product-related issues

---

### 🤖 AI Assistant (NLP-Based Support System)

The platform includes a **smart AI chatbot** available on every page.

#### 🔹 Capabilities:

* Intent detection (Greeting, Query, Issue)
* NLP-based ticket classification
* Confidence-based decision system
* Auto-resolution for common issues
* Guided responses (menu-driven interaction)
* Escalation to human support when required

#### 🔹 Chatbot Features:

* Persistent **Main Menu**
* Interactive UI (button-based options)
* Context-aware responses
* Rule-based + ML hybrid system

---

### 🧠 Human-in-the-Loop Support System

When AI cannot resolve an issue:

1. Ticket is generated
2. Stored in a secure system
3. Admin reviews the issue
4. Admin responds or forwards to seller

#### 📁 Folder Structure:

```id="codeblock1"
human_support/
├── incoming_queries/        # Tickets from AI
├── human_responses/         # Admin replies
├── seller_forward_queue/    # Seller-related escalations
```

---

### 👨‍💼 Admin System (Hidden & Secure)

* Not visible in public UI
* Full system access via secure route
* Manage:

  * Users (buyers & sellers)
  * Products
  * Orders
  * Support tickets

#### Admin Capabilities:

* Resolve user issues
* Forward product issues to sellers
* Train AI system using resolved tickets

---

### 🔁 Seller Escalation System

For product-related complaints:

User → AI → Admin → Seller

Ensures proper handling of:

* Wrong product delivered
* Damaged items
* Seller disputes

---

## 🧠 AI Architecture

The AI assistant follows a hybrid architecture:

```id="codeblock2"
User Message
     ↓
Intent Detection (Rule-based)
     ↓
If simple → Guided Response
     ↓
Else → NLP Classification
     ↓
Confidence Score
     ↓
IF High → Auto Resolution
IF Low → Human Escalation
```

---

## ⚙️ Tech Stack

### Backend:

* Python
* FastAPI
* MongoDB
* Motor (async DB driver)

### AI / NLP:

* scikit-learn (ML models)
* NLTK (text processing)
* TF-IDF Vectorizer
* Logistic Regression

### Frontend:

* React.js
* Custom chatbot UI (floating assistant)

---

## 📡 API Endpoints

### AI Assistant

* `POST /assistant/message`
* `POST /assistant/ticket`
* `GET /assistant/menu`

### Admin

* `GET /admin/tickets`
* `POST /admin/respond`
* `POST /admin/forward-to-seller`
* `POST /admin/train-model`

---

## 🔐 Security Design

* Role-based access (Buyer / Seller / Admin)
* Hidden admin panel (no public access)
* Secure ticket handling system
* Data separation for human support

---

## 🔁 Continuous Learning System

The AI improves over time:

1. Admin resolves tickets
2. Data stored in training dataset
3. Model retrained periodically
4. Accuracy improves automatically

---

## 📌 Future Enhancements

* Live product streaming (core feature expansion)
* Real-time video selling integration
* Payment gateway integration
* Advanced recommendation engine
* Deep learning NLP models (BERT-based)

---

## 📷 UI Preview

* Floating chatbot (bottom-right)
* Menu-driven interaction
* Modern UI inspired by enterprise platforms

---

## 🧑‍💻 Developer Notes

* Modular architecture
* Easily extendable AI system
* Replaceable database layer
* Scalable backend design

---

## 📢 Conclusion

Streaming Sales is not just an e-commerce platform — it is an **AI-driven intelligent support system** that demonstrates:

* NLP-based automation
* Human-in-the-loop design
* Real-world scalable architecture

Perfect for showcasing **full-stack + AI integration skills**.
