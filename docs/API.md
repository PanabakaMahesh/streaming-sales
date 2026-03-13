# StreamSales API Reference

Base URL: `http://localhost:5000/api`

All protected endpoints require the header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Auth

### POST /auth/register
Register a new user.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "buyer"
}
```
`role` must be `"buyer"` or `"seller"`.

**Response 201:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": { "_id": "...", "name": "John Doe", "email": "...", "role": "buyer" },
    "token": "eyJ..."
  }
}
```

---

### POST /auth/login
**Body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```

---

### GET /auth/profile
Returns the authenticated user. Requires JWT.

---

## Products

### GET /products
Query params: `page`, `limit`, `search`, `category`

### POST /products (Seller only)
```json
{
  "name": "Handmade Bracelet",
  "description": "Beautiful beaded bracelet",
  "price": 499,
  "quantity": 50,
  "category": "Fashion",
  "images": ["https://..."]
}
```

---

## Orders

### POST /orders (Buyer only)
```json
{
  "productId": "64abc...",
  "quantity": 2,
  "shippingAddress": {
    "street": "123 MG Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001"
  }
}
```

### PATCH /orders/:id/status (Seller only)
```json
{ "status": "Shipped", "note": "Dispatched via Delhivery" }
```
Valid statuses: `Placed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`

---

## Streams

### POST /stream (Seller only)
```json
{ "title": "Sunday Sale – Jewellery", "description": "Big discounts!" }
```

### POST /stream/start/:id (Seller only)
Returns `rtmpUrl` and `streamKey` for OBS/streaming software.

### POST /stream/stop/:id (Seller only)
Ends the live stream.

---

## Error Responses
All errors follow this format:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [{ "field": "email", "message": "Valid email is required" }]
}
```

Common HTTP status codes:
- `400` – Validation error
- `401` – Not authenticated
- `403` – Forbidden (wrong role)
- `404` – Not found
- `409` – Conflict (duplicate)
- `500` – Server error
