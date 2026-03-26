🚀 StreamSales – AI-Powered Live Commerce Platform

A next-generation full-stack e-commerce platform designed for small sellers who leverage YouTube live streams & social media to sell products in real-time.

StreamSales bridges the gap between content-driven selling and traditional e-commerce, enabling seamless product discovery, live interaction, and instant purchasing.

🧠 Key Highlights
🎥 Live-stream-based product selling
🛒 Real-time commerce experience
🔐 Secure authentication (JWT-based)
👥 Dual-role system (Buyer & Seller)
⚡ Scalable clean architecture (Service-based backend)
🔗 RESTful API design
🏗️ Tech Stack
Layer	Technology
Frontend	React.js (CRA), React Router v6
Backend	Node.js, Express.js
Database	MongoDB + Mongoose
Auth	JWT + bcryptjs
Validation	express-validator
Security	helmet, cors
API Client	Axios
📁 Project Structure
streaming-sales/
│
├── backend/
│   ├── config/            # Database configuration
│   ├── controllers/       # Handles HTTP layer
│   ├── services/          # Business logic (core layer)
│   ├── repositories/      # DB abstraction layer
│   ├── models/            # Mongoose schemas
│   ├── middleware/        # Auth, validation, error handling
│   ├── routes/            # API route definitions
│   ├── utils/             # Helper functions
│   └── server.js          # Entry point
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   └── common/    # Reusable UI components
│       ├── pages/         # Screens (Home, Product, Orders)
│       ├── hooks/         # Custom hooks (Auth, Cart)
│       ├── services/      # API layer (Axios)
│       └── styles/        # Global styles
│
└── docs/                  # Documentation
⚙️ Setup Instructions
🔧 Prerequisites
Node.js ≥ 18
npm ≥ 9
MongoDB (Local / Atlas)
📦 Installation
1. Clone Repository
git clone https://github.com/PanabakaMahesh/streaming-sales.git
cd streaming-sales
🔙 Backend Setup
cd backend
npm install
cp .env.example .env

Update .env:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/streaming-sales
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

Run backend:

npm run dev
🎨 Frontend Setup
cd ../frontend
npm install
cp .env.example .env
REACT_APP_API_URL=http://localhost:5000/api

Run frontend:

npm start
🌐 Application URLs
Frontend → http://localhost:3000
Backend → http://localhost:5000
🔐 Authentication Flow
User registers (Buyer/Seller)
Login returns JWT token
Token stored in frontend
Protected routes accessed via middleware
Role-based authorization enforced
📡 API Overview
🔑 Auth APIs
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile
🛍️ Product APIs
GET /api/products
GET /api/products/:id
POST /api/products (Seller)
PUT /api/products/:id (Seller)
DELETE /api/products/:id (Seller)
📦 Order APIs
POST /api/orders
GET /api/orders/buyer
GET /api/orders/seller
PATCH /api/orders/:id/status
🎥 Stream APIs
GET /api/stream/live
POST /api/stream
POST /api/stream/start/:id
POST /api/stream/stop/:id
👥 User Roles
🧑‍💼 Buyer
Browse products
Watch live streams
Place orders
Track purchases
🏪 Seller
Add/manage products
Start live streams
Manage incoming orders
Update store profile
🗄️ Database Design
Collection	Purpose
users	Authentication + roles
sellerprofiles	Store details
products	Product listings
orders	Purchase records
streams	Live sessions
🧩 Architecture

Clean 4-layer architecture:

Route → Controller → Service → Repository → Database
Why this matters:
🔄 Easy scalability
🧪 Better testing
🧹 Clean separation of concerns
🚀 Production-ready structure
🔍 Health Check
GET /health

Returns server status & environment info.

🚀 Future Enhancements
💳 Payment Integration (Razorpay / Stripe)
🎥 Real-time Streaming (WebRTC / LiveKit)
🤖 AI Product Recommendation Engine
💬 Live Chat during streams (Socket.io)
📊 Seller Analytics Dashboard
⭐ Reviews & Ratings System
🔔 Real-time Notifications
☁️ Cloud Image Upload (AWS S3 / Cloudinary)
