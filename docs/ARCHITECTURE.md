# System Architecture – StreamSales

## Overview

StreamSales follows a clean, layered architecture designed for:
- Separation of concerns
- Testability
- Scalability
- Easy onboarding of new developers

---

## Backend Architecture

```
HTTP Request
    │
    ▼
[ Routes ]          → Define endpoints, attach middleware, call controllers
    │
    ▼
[ Middleware ]       → JWT auth, role guard, validation, error handler
    │
    ▼
[ Controllers ]      → Parse req, call service, send res (NO business logic here)
    │
    ▼
[ Services ]         → All business logic, orchestration, rules
    │
    ▼
[ Repositories ]     → All MongoDB queries (NO logic here)
    │
    ▼
[ Models ]           → Mongoose schemas + instance methods
    │
    ▼
[ MongoDB ]
```

---

## Frontend Architecture

```
App.jsx (Router + AuthProvider)
    │
    ├── Navbar
    ├── ProtectedRoute (role guard wrapper)
    │
    ├── Pages/
    │   ├── LandingPage
    │   ├── LoginPage / RegisterPage
    │   ├── ProductsPage / ProductDetailPage
    │   ├── StreamsPage
    │   ├── BuyerDashboard / BuyerOrdersPage
    │   └── SellerDashboard / SellerProductsPage
    │       SellerOrdersPage / SellerProfilePage / SellerStreamsPage
    │
    ├── components/common/
    │   ├── Button, Input         ← Reusable UI atoms
    │   ├── ProductCard           ← Marketplace card
    │   ├── OrderStatusBadge      ← Status display
    │   ├── Navbar                ← Global navigation
    │   └── ProtectedRoute        ← Auth/role guard
    │
    ├── hooks/
    │   └── useAuth.js            ← Auth context + hook
    │
    └── services/
        └── api.js                ← Axios instance + all API calls
```

---

## Database Design

```
Users ──────────────────┐
  _id                   │
  name                  │ 1:1
  email (unique)        │
  password (hashed)     ▼
  role (buyer/seller)  SellerProfiles
  isActive              _id
  createdAt             userId (ref: User)
  updatedAt             storeName
                        description
                        profileImage
                        totalProducts
                        isVerified

Products ──────────────────────── Orders
  _id                              _id
  name                             buyerId (ref: User)
  description                      sellerId (ref: User)
  price                            productId (ref: Product)
  quantity                         quantity
  sellerId (ref: User)             priceAtPurchase
  images []                        totalAmount
  category                         status (enum)
  isActive                         statusHistory []
  createdAt                        shippingAddress
                                   createdAt

Streams
  _id
  sellerId (ref: User)
  title
  streamKey (unique)
  streamURL
  isLive
  viewerCount
  startedAt / endedAt
  featuredProducts []
  providerData {}       ← placeholder for LiveKit/Agora
```

---

## Security Model

| Concern          | Solution                                     |
|------------------|----------------------------------------------|
| Authentication   | JWT (7-day expiry, verified on every request)|
| Passwords        | bcrypt (12 rounds)                           |
| Role enforcement | `authorize()` middleware on every route      |
| Input validation | express-validator on all POST/PUT routes     |
| XSS/clickjacking | helmet middleware                            |
| CORS             | Restricted to frontend origin                |
| Token storage    | localStorage (upgrade to httpOnly cookie in prod) |

---

## Streaming Architecture (Phase 1 – Placeholder)

The streaming module is built as a **thin shell** with clear extension points.

Current state:
- Create stream sessions → stored in DB
- Generate stream keys → random hex token
- Start/Stop lifecycle → isLive flag + timestamps
- Returns placeholder RTMP URL and stream key

Phase 2 integration point (in `stream.service.js`):
```js
// Replace this comment block with real provider:
const provider = StreamProviderFactory.create(process.env.STREAM_PROVIDER);
const roomData = await provider.createRoom(stream.streamKey);
```

Supported providers (plug in later):
- **LiveKit** – WebRTC-based, self-hostable
- **Agora** – Managed cloud streaming
- **WebRTC** – Custom peer-to-peer

---

## Future Scalability Points

| Feature              | Where to plug in                          |
|----------------------|-------------------------------------------|
| Payments             | New `payment.service.js` + order checkout |
| AI Assistant         | Separate `ai/` module, clean boundary     |
| Recommendations      | `recommendation.service.js`, product feed |
| Real-time chat       | Socket.io layer on `server.js`            |
| Notifications        | Event emitter → notification service      |
| Image uploads        | Multer + Cloudinary in product service    |
| Analytics            | Separate analytics service + cron jobs   |
