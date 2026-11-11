# REST API Specification

This document details the REST API specifications for public and authenticated internal endpoints across all platform levels.

---

## 1. General Conventions

- **Base URL:** `/api/v1`
- **Content-Type:** `application/json`
- **Character Encoding:** UTF-8 (supports English and Amharic script natively)
- **Authentication:** Bearer token / Supabase Auth session cookie on private routes
- **Pagination:** Query parameters `?page=1&limit=20` (Max limit: `100`)

---

## 2. Public API Endpoints (Level 1 & Level 2)

### 2.1 Fetch Restaurant Public Menu
Retrieves the active categories and food/beverage items for a restaurant.

- **Endpoint:** `GET /api/v1/restaurants/:slug/menu`
- **Authentication:** None (Public)
- **Query Parameters:**
  - `lang` (optional): `"en"` or `"am"` (records anonymous view counter)

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": "e0b8a3e0-8a71-48e0-a7d1-21c6ec0c50d1",
      "name": "ፍሬ ባር እና ሬስቶራንት",
      "slug": "fre-bar",
      "currency": "ETB",
      "logoUrl": null,
      "coverUrl": null
    },
    "categories": [
      {
        "id": "c1f7b8a2-11e2-49fa-a589-3d1f11245a90",
        "name": "Meat Dishes",
        "nameAm": "የስጋ ምግቦች",
        "products": [
          {
            "id": "p9a8b7c6-22d3-48eb-bf34-5f1e11245a99",
            "name": "Special Kitfo",
            "nameAm": "ልዩ ክትፎ",
            "description": "Finely minced lean beef seasoned in mitmita and niter kibbeh",
            "descriptionAm": "ጥራት ካለው የበሬ ስጋ በቅቤ እና ሚጥሚጣ የተዘጋጀ",
            "price": "450.00",
            "imageUrl": null,
            "isAvailable": true
          }
        ]
      }
    ]
  }
}
```

---

### 2.2 Submit Customer Order (Level 2)
Submits a customer order from a table QR code.

- **Endpoint:** `POST /api/v1/public/orders`
- **Authentication:** None (Requires valid `qrToken`)
- **Rate Limit:** 5 requests per minute per IP

**Request Body:**
```json
{
  "qrToken": "tbl-fre-01-sec782",
  "customerName": "Dawit Tesfaye",
  "customerPhone": "+251911223344",
  "notes": "Extra spicy mitmita on the side",
  "items": [
    {
      "productId": "p9a8b7c6-22d3-48eb-bf34-5f1e11245a99",
      "quantity": 2,
      "notes": "Medium rare"
    }
  ]
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "orderId": "ord-8839-4412",
    "orderNumber": "#104",
    "status": "PENDING",
    "subtotal": "900.00",
    "tax": "0.00",
    "total": "900.00",
    "trackingUrl": "/order/ord-8839-4412"
  }
}
```

---

## 3. Operations API Endpoints (Level 3)

### 3.1 Kitchen Order Stream
Fetches active orders for the Kitchen Display System (KDS).

- **Endpoint:** `GET /api/v1/kitchen/orders`
- **Authentication:** Required (`KITCHEN`, `MANAGER`, `OWNER`)

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "orderId": "ord-8839-4412",
      "orderNumber": "#104",
      "tableNumber": "Table 4",
      "elapsedMinutes": 6,
      "status": "PREPARING",
      "items": [
        {
          "productName": "Special Kitfo",
          "quantity": 2,
          "notes": "Medium rare"
        }
      ]
    }
  ]
}
```

### 3.2 Update Order Status
Transitions an order through fulfillment stages.

- **Endpoint:** `PATCH /api/v1/orders/:id/status`
- **Authentication:** Required (`KITCHEN`, `WAITER`, `MANAGER`, `OWNER`)

**Request Body:**
```json
{
  "status": "READY"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Order status updated to READY",
  "data": {
    "orderId": "ord-8839-4412",
    "status": "READY",
    "updatedAt": "2026-11-08T14:45:00Z"
  }
}
```

### 3.3 Record Cashier Payment
Records cash, Telebirr, or card payments.

- **Endpoint:** `POST /api/v1/orders/:id/payments`
- **Authentication:** Required (`CASHIER`, `MANAGER`, `OWNER`)

**Request Body:**
```json
{
  "amount": 900.00,
  "method": "TELEBIRR",
  "transactionId": "TLB9938472911"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "paymentId": "pay-3918-aa92",
    "orderId": "ord-8839-4412",
    "amount": "900.00",
    "method": "TELEBIRR",
    "status": "PAID",
    "paidAt": "2026-11-08T14:50:00Z"
  }
}
```

---

## 4. ERP & Platform API Endpoints (Level 4 & 5)

### 4.1 Daily Sales Aggregate Report
- **Endpoint:** `GET /api/v1/reports/sales`
- **Authentication:** Required (`OWNER`, `MANAGER`)
- **Query Parameters:** `startDate=2026-11-01&endDate=2026-11-08`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": "128450.00",
    "totalOrders": 342,
    "averageOrderValue": "375.58",
    "breakdownByMethod": {
      "TELEBIRR": "84500.00",
      "CASH": "36250.00",
      "CARD": "7700.00"
    }
  }
}
```

---

## 5. Standard Error Codes
| HTTP Status | Code | Meaning |
|---|---|---|
| `400 Bad Request` | `VALIDATION_FAILED` | Input payload validation error (e.g. invalid price or phone) |
| `401 Unauthorized`| `UNAUTHORIZED` | User session missing or expired |
| `403 Forbidden`   | `FORBIDDEN` | User does not have permission in this restaurant |
| `404 Not Found`   | `NOT_FOUND` | Restaurant, table, product, or order not found |
| `409 Conflict`    | `CONFLICT` | Duplicate submission or order already completed |
| `429 Too Many Req`| `RATE_LIMITED` | Public endpoint rate limit triggered |
| `500 Server Error`| `INTERNAL_ERROR` | Unhandled server error |

