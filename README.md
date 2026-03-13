# StreamSales – Live Commerce E-Commerce Platform

A full-stack e-commerce platform built for small sellers who sell products through YouTube live streams and social media.

---

## Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | React.js (CRA), React Router v6 |
| Backend    | Node.js, Express.js     |
| Database   | MongoDB, Mongoose ODM   |
| Auth       | JWT + bcryptjs          |
| Validation | express-validator       |
| Security   | helmet, cors            |

---

## Project Structure

```
streaming-sales/
│
├── backend/
│   ├── config/           # DB connection
│   ├── controllers/      # Route handlers (thin layer)
│   ├── services/         # Business logic
│   ├── repositories/     # Data access layer
│   ├── models/           # Mongoose schemas
│   ├── middleware/        # Auth, error handling
│   ├── routes/           # Express route definitions
│   ├── utils/            # Shared utilities
│   └── server.js         # App entry point
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   └── common/   # Navbar, Button, Input, ProductCard, etc.
│       ├── pages/        # All page components
│       ├── hooks/        # useAuth context + hook
│       ├── services/     # Axios API client
│       └── styles/       # Global CSS + design tokens
│
└── docs/
```

---

## Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- npm >= 9

---

## Installation & Setup

### 1. Clone / extract the project

```bash
cd streaming-sales
```

### 2. Install Backend dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend environment

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/streaming-sales
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. Install Frontend dependencies

```bash
cd ../frontend
npm install
```

### 5. Configure Frontend environment

```bash
cp .env.example .env
```

`frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Running the App

### Start MongoDB (if local)

```bash
mongod
```

### Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

Backend runs at: `http://localhost:5000`

### Start Frontend (Terminal 2)

```bash
cd frontend
npm start
```

Frontend runs at: `http://localhost:3000`

---

## API Endpoints

### Auth
| Method | Endpoint              | Access  | Description          |
|--------|-----------------------|---------|----------------------|
| POST   | /api/auth/register    | Public  | Register buyer/seller |
| POST   | /api/auth/login       | Public  | Login                |
| GET    | /api/auth/profile     | Private | Get own profile      |

### Products
| Method | Endpoint                  | Access        | Description         |
|--------|---------------------------|---------------|---------------------|
| GET    | /api/products             | Public        | List all products   |
| GET    | /api/products/:id         | Public        | Product detail      |
| GET    | /api/products/seller/my   | Seller only   | My products         |
| POST   | /api/products             | Seller only   | Create product      |
| PUT    | /api/products/:id         | Seller only   | Update product      |
| DELETE | /api/products/:id         | Seller only   | Delete product      |

### Orders
| Method | Endpoint                  | Access        | Description         |
|--------|---------------------------|---------------|---------------------|
| POST   | /api/orders               | Buyer only    | Place order         |
| GET    | /api/orders/buyer         | Buyer only    | My orders           |
| GET    | /api/orders/seller        | Seller only   | Received orders     |
| GET    | /api/orders/:id           | Auth          | Order detail        |
| PATCH  | /api/orders/:id/status    | Seller only   | Update status       |

### Sellers
| Method | Endpoint              | Access      | Description           |
|--------|-----------------------|-------------|-----------------------|
| GET    | /api/sellers          | Public      | All sellers           |
| GET    | /api/sellers/:id      | Public      | Seller public profile |
| GET    | /api/sellers/me/profile | Seller    | My store profile      |
| PUT    | /api/sellers/update   | Seller only | Update store          |

### Streams
| Method | Endpoint              | Access      | Description          |
|--------|-----------------------|-------------|----------------------|
| GET    | /api/stream/live      | Public      | Live streams         |
| GET    | /api/stream/:id       | Public      | Stream detail        |
| POST   | /api/stream           | Seller only | Create stream        |
| POST   | /api/stream/start/:id | Seller only | Start stream         |
| POST   | /api/stream/stop/:id  | Seller only | Stop stream          |

---

## User Roles

### Buyer
- Browse marketplace
- View product details
- Place orders
- View order history
- Watch live streams

### Seller
- Create / edit / delete products
- Manage orders (update status)
- Start / stop live streams
- Edit store profile
- Cannot buy products (create a separate buyer account)

---

## Database Collections

- **users** – Auth accounts with role (buyer/seller)
- **sellerprofiles** – Store details linked to seller users
- **products** – Product listings by sellers
- **orders** – Purchase records with status history
- **streams** – Live stream sessions

---

## Architecture Notes

The backend follows a 4-layer clean architecture:

```
Request → Route → Controller → Service → Repository → MongoDB
```

- **Controllers** handle HTTP only (req/res)
- **Services** contain all business logic
- **Repositories** contain all DB queries
- **Models** define schemas

---

## Future Roadmap (Phase 2+)

- [ ] Payment gateway (Razorpay / Stripe)
- [ ] Real streaming provider (LiveKit / Agora / WebRTC)
- [ ] AI product recommendation engine
- [ ] AI seller assistant chatbot
- [ ] Reviews and ratings system
- [ ] Real-time notifications (Socket.io)
- [ ] Real-time live stream chat
- [ ] Analytics dashboard
- [ ] Image upload (Cloudinary / S3)

---

## Health Check

```
GET http://localhost:5000/health
```

Returns server status and environment info.
