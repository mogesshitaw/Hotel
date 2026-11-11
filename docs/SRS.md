# RESTAURANT MANAGEMENT SaaS PLATFORM
## Complete Software Requirements Specification & Technical Documentation

- **Document Type:** Software Requirements Specification (SRS) and Technical Design Document
- **Project:** Multi-Restaurant Management SaaS Platform
- **Initial Customer:** ፍሬ ባር እና ሬስቶራንት (Fre Bar & Restaurant)
- **Technology:** Next.js (App Router), TypeScript, Prisma ORM, PostgreSQL
- **Hosting:** Vercel + Supabase
- **Architecture:** Multi-Tenant Shared Database SaaS
- **Document Version:** 1.0

---

## 1. Executive Summary

### 1.1 Project Overview
The Restaurant Management SaaS Platform is a web-based multi-tenant system designed to digitize and streamline daily operations for restaurants, cafes, and bars. 

The platform supports multiple independent restaurants on a centralized, scalable cloud application. Each tenant retains strict data isolation and manages their own:
- Restaurant profile & branding
- Multi-branch locations
- Employees, roles, and granular permissions
- Multilingual digital menus (English & Amharic)
- Dynamic table & branch QR codes
- Dine-in tables & floor layout
- End-to-end customer orders & status tracking
- Kitchen Display System (KDS)
- Point of Sale (POS) & cashier operations
- Multi-branch inventory & raw ingredient tracking
- Financial records, supplier balances, and expense management
- Real-time analytics and reporting
- Recurring subscription billing

The initial rollout is dedicated to **ፍሬ ባር እና ሬስቶራንት**, but the architecture natively supports instant self-service onboarding of subsequent restaurants without needing separate codebases or isolated databases.

### 1.2 Main Objectives
- **Digitize Restaurant Operations:** Eliminate paper-based order pads and manual tally sheets.
- **Contactless QR Menu:** Allow customers to browse rich digital menus on their mobile devices without installing an app or logging in.
- **Real-Time Kitchen Communication:** Connect customer orders and waiter terminals directly to the Kitchen Display System (KDS) instantly.
- **Sales & Financial Visibility:** Provide owners and managers with actionable real-time metrics on sales, revenue, and daily balances.
- **Stock & Recipe Inventory:** Automate stock deduction per order item via recipe breakdowns.
- **Multi-Branch Hierarchy:** Enable restaurant owners to monitor and control multiple branches from a single unified portal.
- **SaaS Subscription Engine:** Monetize platform tiers via recurring subscription plans.
- **Localization:** Native support for Ethiopian Birr (ETB), English, and Amharic (`አማርኛ`).

### 1.3 Product Vision
To become the premier all-in-one restaurant operating platform across Ethiopia and East Africa, combining modern digital ordering, kitchen automation, inventory ERP, and local payment gateways (Telebirr, CBE Birr, Chapa).

---

## 2. Five Development Levels

The platform follows a phased 5-level evolutionary delivery model:

```mermaid
flowchart LR
    L1["Level 1<br/><b>QR Digital Menu</b>"] --> L2["Level 2<br/><b>Online Ordering</b>"]
    L2 --> L3["Level 3<br/><b>Full Operations (POS, KDS, Staff)</b>"]
    L3 --> L4["Level 4<br/><b>Restaurant ERP (Stock & Finance)</b>"]
    L4 --> L5["Level 5<br/><b>Enterprise Multi-Tenant SaaS</b>"]
```

### Level 1 — QR Digital Menu *(Completed / MVP Baseline)*
- **Objective:** Enable restaurants to publish a responsive digital menu accessible through QR codes.
- **Core Features:**
  - Restaurant profile, branding (logo, cover image), contact info, and currency (default: `ETB`).
  - Categorized food & beverage listings with dual-language names & descriptions (English & Amharic).
  - Availability toggles (active, sold out, inactive).
  - High-resolution QR code generator with downloadable image assets.
  - Public, lightweight, mobile-first menu view requiring no authentication.
  - Page-view analytics recording traffic and language preference.
- **Key Routes:**
  - `/menu/[slug]` — Public restaurant menu
  - `/menu/[slug]/category/[id]` — Category product view
  - `/dashboard` — Restaurant owner/manager overview
  - `/dashboard/menu` & `/dashboard/categories` & `/dashboard/products` — Menu management
  - `/dashboard/qr-codes` — QR generation & asset downloads
  - `/dashboard/settings` — Profile, branding, and localization settings

### Level 2 — Interactive Menu & Online Ordering
- **Objective:** Transform the static menu into an active ordering portal.
- **Core Features:**
  - Client-side shopping cart with product options and special instructions.
  - Table identification via cryptographic QR tokens (e.g. `/menu/[slug]?table=[token]`).
  - Takeaway and dine-in mode selection.
  - Server-validated order creation with server-side price calculation.
  - Real-time customer order tracking (`/order/[id]`).
- **Order Status Lifecycle:**
  `PENDING` ➔ `ACCEPTED` ➔ `PREPARING` ➔ `READY` ➔ `SERVED` ➔ `COMPLETED` (or `CANCELLED`)

### Level 3 — Complete Restaurant Operations (POS, KDS, Cashier)
- **Objective:** Full in-house operations suite for daily restaurant workflows.
- **Modules:**
  - **Restaurant Dashboard:** Today's sales, active orders, live table occupancy, top-selling items.
  - **Order Management:** Accept, cancel, assign waiters, and filter order streams.
  - **Kitchen Display System (KDS):** Real-time order cards, preparation timers, item-level completion.
  - **Waiter Management:** Handheld order entry, table assignment, instant ready-alert notifications.
  - **Table Management:** Floor plan layouts, capacities, QR binding, and live status.
  - **POS (Point of Sale):** In-person rapid ordering, split bills, tax/discount calculation, and receipt printing.
  - **Cashier Management:** Payment collection, cash drawer sessions, daily reconciliation, refunds.
  - **Employee Management:** Role-based access control (`OWNER`, `MANAGER`, `WAITER`, `KITCHEN`, `CASHIER`).

### Level 4 — Restaurant ERP (Inventory, Purchasing & Finance)
- **Objective:** Complete back-office resource planning and cost accounting.
- **Modules:**
  - **Inventory Management:** Stock balance by branch, unit conversions (kg, g, L, pcs), minimum stock reorder alerts.
  - **Recipe & Ingredients:** Bill of Materials (BOM) linking menu items to raw ingredients; automatic stock depletion upon order completion.
  - **Suppliers & Purchasing:** Vendor catalog, Purchase Orders (PO), Goods Receipt Notes (GRN), and invoice reconciliation.
  - **Expense Tracking:** Operating expenses (rent, utilities, payroll, repairs) with receipt uploads.
  - **Financial Summary:** Gross sales, Cost of Goods Sold (COGS), operating expenses, and estimated net profit.
  - **Table Reservations:** Booking calendar, party size limits, deposit management.
  - **Delivery Logistics:** Driver dispatching, customer address geocoding, delivery fees.

### Level 5 — Enterprise Multi-Tenant SaaS Platform
- **Objective:** Scalable commercial SaaS supporting hundreds of restaurant brands with multiple branches.
- **Modules:**
  - **Platform Super Admin:** Master tenant index, onboarding wizard, suspension/activation, and global audit log.
  - **Subscription Billing:** Tiered plans (Basic, Standard, Premium), automated invoices, and feature flags.
  - **Enterprise Analytics:** Platform-wide Gross Merchandise Value (GMV), Monthly Recurring Revenue (MRR), churn rate, and branch benchmarks.
  - **Integrations:** Telebirr, CBE Birr, Chapa, SMS gateways (Twilio/local telcos), and external thermal printers.

---

## 3. Technology Stack & Architecture

### 3.1 Technology Matrix
| Layer | Technology | Version / Tool | Purpose |
|---|---|---|---|
| **Frontend Framework** | Next.js (App Router) | 14.2.x | Server Components, fast SSR, streaming, and Route Handlers |
| **Language** | TypeScript | 5.6.x | Strict type safety across client and server boundaries |
| **Styling** | Tailwind CSS | 3.4.x | Utility-first responsive design, mobile-friendly menus |
| **Database ORM** | Prisma ORM | 5.22.x | Type-safe migrations, queries, and connection management |
| **Database** | PostgreSQL | 15+ | Relational data integrity, UUIDs, Decimal monetary types |
| **Cloud Database** | Supabase | Managed PG | Hosted PostgreSQL, Connection Pooler (PgBouncer/Supavisor) |
| **Authentication** | Supabase Auth | Gotrue | JWT-based auth, session cookies, passwordless & email login |
| **File Storage** | Supabase Storage | S3-compatible | Secure bucket storage for menus, logos, and receipt attachments |
| **Realtime Engine** | Supabase Realtime | WebSockets | Live KDS order queues, waiter alerts, and table status |
| **Hosting** | Vercel | Edge & Node.js | Global CDN edge caching, zero-config CI/CD deployments |

### 3.2 High-Level System Architecture

```mermaid
graph TD
    ClientCustomers["Customers (Mobile Web)"] -->|Scan QR / Browse / Order| VercelEdge["Vercel Edge & CDN"]
    ClientStaff["Staff & Managers (Tablets/Desktops)"] -->|Dashboard / POS / KDS| VercelEdge

    subgraph "Next.js Application (Hosted on Vercel)"
        VercelEdge --> PublicUI["Public Menu (/menu/[slug])"]
        VercelEdge --> DashboardUI["Protected Dashboard (/dashboard/*)"]
        VercelEdge --> RouteHandlers["API Route Handlers (/api/v1/*)"]
        
        PublicUI --> AppServices["Application Service Layer"]
        DashboardUI --> AppServices
        RouteHandlers --> AppServices
    end

    subgraph "Data & Persistence Layer"
        AppServices -->|Type-safe CRUD & Tx| PrismaClient["Prisma ORM Client"]
        AppServices -->|Complex Reports & Aggregations| RawSQL["Raw SQL Engine"]
        
        PrismaClient --> SupabasePool["Supabase Connection Pooler"]
        RawSQL --> SupabasePool
        SupabasePool --> PostgresDB[("PostgreSQL Database")]
    end

    subgraph "Supabase Cloud Ecosystem"
        PostgresDB <--> SupabaseAuth["Supabase Auth (JWT)"]
        PostgresDB <--> SupabaseStorage["Supabase Storage (Assets)"]
        PostgresDB <--> SupabaseRealtime["Supabase Realtime (WebSockets)"]
    end

    SupabaseRealtime -.->|Live order notifications| ClientStaff
```

---

## 4. Multi-Tenant Architecture & Data Isolation

### 4.1 Tenancy Strategy: Shared Database, Shared Schema
The platform implements a **Tenant-Partitioned Shared Database** architecture:
- Every tenant represents a distinct `Restaurant`.
- Every tenant-owned table carries a foreign key `restaurantId UUID NOT NULL`.
- Child tables (e.g., `OrderItem`, `RecipeItem`) maintain tenant continuity through parent joins or composite foreign keys (`[restaurantId, id]`).
- Sub-locations are modeled via `Branch` (`branchId`), with tables and orders scoped to both a restaurant and a specific branch.

### 4.2 Strict Tenant Isolation Guardrails
1. **Never Trust Client Restaurant IDs:** The server extracts the authenticated `userId` from verified session tokens, verifies that user's active `Membership` in the target `restaurantId`, and strictly verifies permissions.
2. **Server-Side Enforcement:** Every Prisma query and raw SQL statement must enforce `WHERE "restaurantId" = :targetRestaurantId`.
3. **Defense in Depth (RLS):** For any direct database access, PostgreSQL Row Level Security (RLS) policies validate `auth.uid()` against tenant membership tables.

```typescript
// src/lib/auth/require-restaurant-access.ts
import { prisma } from "@/lib/prisma";

export async function requireRestaurantAccess(
  userId: string,
  restaurantId: string
) {
  const membership = await prisma.membership.findUnique({
    where: {
      restaurantId_userId: {
        restaurantId,
        userId,
      },
    },
  });

  if (!membership || !membership.isActive) {
    throw new Error("Forbidden: You do not have access to this restaurant.");
  }

  return membership;
}
```

---

## 5. User Roles and Permission Matrix

### 5.1 Platform-Level vs Restaurant-Level Roles
- **Platform Super Admin:** Platform-wide oversight, tenant provisioning, subscription management, and system logs.
- **Restaurant Roles:**
  - `OWNER`: Full administrative, operational, and financial control over the restaurant and all branches.
  - `MANAGER`: Daily operations, menu changes, staff scheduling, inventory, and operational reports.
  - `WAITER`: View assigned tables, create and submit customer orders, monitor preparation status, request bills.
  - `KITCHEN`: Access Kitchen Display System, accept tickets, update prep stages.
  - `CASHIER`: View open bills, collect payments, issue receipts, close cashier shifts.
  - `CUSTOMER`: Public guest; browse menus, configure orders, and track order state.

### 5.2 Permission Matrix
| Module / Capability | Super Admin | Owner | Manager | Waiter | Kitchen | Cashier | Customer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Tenant & Plan Settings | **Full** | View/Upgrade | None | None | None | None | None |
| Restaurant Profile & Branding | **Full** | **Full** | View | None | None | None | None |
| Categories & Products | View | **Full** | **Manage** | View | View | View | Public View |
| Public Menu & QR Codes | View | **Full** | **Full** | View | None | None | Scan/View |
| Dine-In Order Placement | None | **Full** | **Manage** | **Create** | None | View | Create (QR) |
| Kitchen Display (KDS) | None | **Full** | View | View | **Manage** | View | None |
| POS & Payment Collection | None | **Full** | **Manage** | None | None | **Full** | Pay Only |
| Inventory & Recipes | None | **Full** | **Manage** | None | View | None | None |
| Purchasing & Expenses | None | **Full** | **Manage** | None | None | Limited | None |
| Financial Reports & Margins | Global | **Full** | Limited | None | None | Shift Only | None |
| Staff & Role Assignment | None | **Full** | Limited | None | None | None | None |

---

## 6. Complete Database Design

### 6.1 Entity Relationship Diagram

```mermaid
erDiagram
    RESTAURANT ||--o{ BRANCH : owns
    RESTAURANT ||--o{ MEMBERSHIP : has
    USER ||--o{ MEMBERSHIP : joins
    RESTAURANT ||--o{ CATEGORY : owns
    CATEGORY ||--o{ PRODUCT : contains
    RESTAURANT ||--o{ PRODUCT : owns
    BRANCH ||--o{ RESTAURANT_TABLE : contains
    RESTAURANT ||--o{ ORDER : owns
    BRANCH ||--o{ ORDER : receives
    RESTAURANT_TABLE ||--o{ ORDER : serves
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : references
    ORDER ||--o{ PAYMENT : receives
    RESTAURANT ||--o| SUBSCRIPTION : subscribes
    BRANCH ||--o{ INVENTORY : maintains
    INVENTORY ||--o{ STOCK_MOVEMENT : records
    PRODUCT ||--o| RECIPE : uses
    RECIPE ||--o{ RECIPE_ITEM : contains
    INGREDIENT ||--o{ RECIPE_ITEM : used_in
```

### 6.2 Complete Enterprise Prisma Schema

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ==========================================
// ENUMS
// ==========================================

enum RestaurantRole {
  OWNER
  MANAGER
  WAITER
  KITCHEN
  CASHIER
}

enum OrderStatus {
  PENDING
  ACCEPTED
  PREPARING
  READY
  SERVED
  COMPLETED
  CANCELLED
}

enum OrderType {
  DINE_IN
  TAKEAWAY
  DELIVERY
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum PaymentMethod {
  CASH
  TELEBIRR
  BANK_TRANSFER
  CARD
  OTHER
}

// ==========================================
// CORE TENANT & USER MODELS
// ==========================================

model Restaurant {
  id          String   @id @default(uuid()) @db.Uuid
  name        String
  nameAm      String?
  slug        String   @unique
  description String?
  logoUrl     String?
  coverUrl    String?
  phone       String?
  email       String?
  currency    String   @default("ETB")
  timezone    String   @default("Africa/Addis_Ababa")
  isActive    Boolean  @default(true)

  branches     Branch[]
  memberships  Membership[]
  categories   Category[]
  products     Product[]
  orders       Order[]
  subscription Subscription?
  menuViews    MenuView[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([slug])
}

model User {
  id          String   @id @db.Uuid // Matches Supabase Auth uid
  name        String
  email       String   @unique
  phone       String?
  isActive    Boolean  @default(true)

  memberships Membership[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Membership {
  id           String         @id @default(uuid()) @db.Uuid
  restaurantId String         @db.Uuid
  userId       String         @db.Uuid
  role         RestaurantRole
  isActive     Boolean        @default(true)

  restaurant Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([restaurantId, userId])
  @@index([userId])
}

model Branch {
  id           String   @id @default(uuid()) @db.Uuid
  restaurantId String   @db.Uuid
  name         String
  code         String
  address      String?
  isMain       Boolean  @default(false)

  restaurant Restaurant        @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  tables     RestaurantTable[]
  orders     Order[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([restaurantId, code])
  @@unique([restaurantId, id])
  @@index([restaurantId])
}

// ==========================================
// MENU & CATALOG
// ==========================================

model Category {
  id           String  @id @default(uuid()) @db.Uuid
  restaurantId String  @db.Uuid
  name         String
  nameAm       String?
  sortOrder    Int     @default(0)
  isActive     Boolean @default(true)

  restaurant Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  products   Product[]

  @@unique([restaurantId, name])
  @@unique([restaurantId, id])
}

model Product {
  id            String   @id @default(uuid()) @db.Uuid
  restaurantId  String   @db.Uuid
  categoryId    String?  @db.Uuid
  name          String
  nameAm        String?
  description   String?
  descriptionAm String?
  price         Decimal  @db.Decimal(12, 2)
  imageUrl      String?
  isAvailable   Boolean  @default(true)
  isActive      Boolean  @default(true)

  restaurant Restaurant  @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  category   Category?   @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  orderItems OrderItem[]

  @@index([restaurantId, categoryId])
  @@index([restaurantId, isAvailable])
}

model RestaurantTable {
  id           String   @id @default(uuid()) @db.Uuid
  restaurantId String   @db.Uuid
  branchId     String   @db.Uuid
  tableNumber  String
  capacity     Int      @default(4)
  qrToken      String   @unique
  isActive     Boolean  @default(true)

  branch Branch  @relation(fields: [branchId], references: [id], onDelete: Cascade)
  orders Order[]

  @@unique([branchId, tableNumber])
  @@unique([restaurantId, id])
}

// ==========================================
// ORDERS & BILLING
// ==========================================

model Order {
  id            String      @id @default(uuid()) @db.Uuid
  restaurantId  String      @db.Uuid
  branchId      String      @db.Uuid
  tableId       String?     @db.Uuid
  orderNumber   String
  type          OrderType   @default(DINE_IN)
  status        OrderStatus @default(PENDING)
  customerName  String?
  customerPhone String?
  notes         String?

  subtotal Decimal @db.Decimal(12, 2)
  tax      Decimal @default(0) @db.Decimal(12, 2)
  discount Decimal @default(0) @db.Decimal(12, 2)
  total    Decimal @db.Decimal(12, 2)

  restaurant Restaurant       @relation(fields: [restaurantId], references: [id], onDelete: Restrict)
  branch     Branch           @relation(fields: [branchId], references: [id], onDelete: Restrict)
  table      RestaurantTable? @relation(fields: [tableId], references: [id], onDelete: SetNull)

  items    OrderItem[]
  payments Payment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([restaurantId, orderNumber])
  @@index([restaurantId, status, createdAt])
  @@index([branchId, createdAt])
}

model OrderItem {
  id          String   @id @default(uuid()) @db.Uuid
  orderId     String   @db.Uuid
  productId   String?  @db.Uuid
  productName String
  quantity    Int
  unitPrice   Decimal  @db.Decimal(12, 2)
  totalPrice  Decimal  @db.Decimal(12, 2)
  notes       String?

  order   Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product? @relation(fields: [productId], references: [id], onDelete: SetNull)

  @@index([orderId])
}

model Payment {
  id            String        @id @default(uuid()) @db.Uuid
  orderId       String        @db.Uuid
  amount        Decimal       @db.Decimal(12, 2)
  method        PaymentMethod
  status        PaymentStatus @default(PENDING)
  transactionId String?
  paidAt        DateTime?

  order Order @relation(fields: [orderId], references: [id], onDelete: Restrict)

  createdAt DateTime @default(now())

  @@index([orderId, status])
}

model Subscription {
  id           String    @id @default(uuid()) @db.Uuid
  restaurantId String    @unique @db.Uuid
  planCode     String
  status       String
  startsAt     DateTime
  endsAt       DateTime?

  restaurant Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
}

model MenuView {
  id           String   @id @default(uuid()) @db.Uuid
  restaurantId String   @db.Uuid
  lang         String
  createdAt    DateTime @default(now())

  restaurant Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  @@index([restaurantId, createdAt])
}
```

---

## 7. API Architecture & Standards

### 7.1 Protocol & Response Format
All private routes live under `/api/v1/` and enforce JSON schemas, Bearer/Session JWT verification, and structured status codes.

#### Standard Success Payload
```json
{
  "success": true,
  "message": "Resource processed successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 120
  }
}
```

#### Standard Error Payload
```json
{
  "success": false,
  "message": "Invalid permissions to perform this action",
  "code": "FORBIDDEN"
}
```

### 7.2 API Endpoint Registry by Level

#### Public Endpoints (Level 1 & 2)
- `GET /api/v1/restaurants/:slug/menu` — Retrieve public categorized menu
- `GET /api/v1/restaurants/:slug/categories` — List active categories
- `GET /api/v1/restaurants/:slug/products` — Filter products by category/query
- `POST /api/v1/public/orders` — Submit customer order from table QR (rate-limited, server-priced)
- `GET /api/v1/public/orders/:id/status` — Safe customer status tracker

#### Operations Endpoints (Level 3)
- `GET /api/v1/orders` — List active restaurant orders with status filters
- `GET /api/v1/orders/:id` — Full order detail with items and payment ledger
- `PATCH /api/v1/orders/:id/status` — Advance order state (`ACCEPTED`, `PREPARING`, `READY`, `SERVED`, etc.)
- `GET /api/v1/kitchen/orders` — Kitchen order stream with elapsed preparation counters
- `POST /api/v1/pos/orders` — Create cashier/waiter in-person ticket
- `POST /api/v1/orders/:id/payments` — Record cash/Telebirr payment transaction

#### ERP & SaaS Management Endpoints (Level 4 & 5)
- `GET /api/v1/inventory` — Branch inventory balances and low-stock alerts
- `POST /api/v1/inventory/adjustments` — Record manual stock adjustment with reason
- `POST /api/v1/recipes` — Connect menu product to BOM ingredient formulas
- `GET /api/v1/reports/sales-summary` — Daily/weekly sales aggregates
- `GET /api/v1/platform/restaurants` — Super Admin tenant directory

---

## 8. Business Logic & Critical Workflows

### 8.1 Customer QR Ordering Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (Phone)
    participant QR as Table QR
    participant Menu as Next.js Menu View
    participant API as /api/v1/public/orders
    participant DB as PostgreSQL (Prisma Tx)
    participant KDS as Kitchen Display System

    Customer->>QR: Scan QR code at table
    QR->>Menu: Open /menu/[slug]?table=[token]
    Menu->>Customer: Render bilingual menu
    Customer->>Menu: Add items to cart & submit
    Menu->>API: POST order (items, quantities, table token)
    API->>DB: Validate table token & fetch official item prices
    Note over API,DB: Server calculates subtotal, tax, & total.<br/>Ignores client-sent prices.
    DB->>DB: Save Order & OrderItems in single transaction
    DB->>KDS: Broadcast Realtime event (ORDER_CREATED)
    API-->>Menu: Return orderId & tracking token
    Menu-->>Customer: Display live status screen (/order/[id])
```

### 8.2 Safe Server-Side Order Creation (Idempotent & Price-Validated)

```typescript
// Production order creation transaction
const order = await prisma.$transaction(async (tx) => {
  // 1. Fetch authorized database prices for requested products
  const products = await tx.product.findMany({
    where: {
      restaurantId,
      id: { in: requestedProductIds },
      isAvailable: true,
      isActive: true,
    },
  });

  if (products.length !== requestedProductIds.length) {
    throw new Error("One or more selected items are unavailable.");
  }

  // 2. Compute accurate line item costs strictly on server
  const calculatedItems = requestedItems.map((item) => {
    const dbProduct = products.find((p) => p.id === item.productId)!;
    const unitPrice = dbProduct.price;
    const totalPrice = Number(unitPrice) * item.quantity;
    return {
      productId: dbProduct.id,
      productName: dbProduct.name,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      notes: item.notes || null,
    };
  });

  const subtotal = calculatedItems.reduce((acc, curr) => acc + Number(curr.totalPrice), 0);
  const total = subtotal; // Apply tax/discounts per restaurant rules

  // 3. Persist order and line items
  return tx.order.create({
    data: {
      restaurantId,
      branchId,
      tableId,
      orderNumber: generateOrderNumber(),
      type: "DINE_IN",
      status: "PENDING",
      subtotal,
      tax: 0,
      discount: 0,
      total,
      items: {
        create: calculatedItems,
      },
    },
    include: { items: true },
  });
});
```

---

## 9. Security, Authentication & Audit Trails

### 9.1 Authentication Infrastructure
- Authentication is governed by **Supabase Auth** (email/password, OAuth, and magic links).
- Client applications store signed HTTP-only session cookies.
- Server Route Handlers and Server Actions extract the authenticated user UUID via Supabase Auth, then match it to the application `User.id` and active `Membership`.

### 9.2 Key Security Principles
- **No Client Price Manipulation:** Product pricing and totals are exclusively derived server-side from PostgreSQL records.
- **Service Role Protection:** `SUPABASE_SERVICE_ROLE_KEY` is exclusively consumed in secure server runtimes and is never exposed to browser bundles.
- **SQL Injection Immunization:** All queries utilize Prisma ORM parameterized builders or parameterized Raw SQL templates.
- **Immutable Audit Logging:** Crucial actions (role modifications, price adjustments, stock manual overrides, refunds, and order cancellations) emit entries into an audit ledger containing tenant ID, acting user ID, timestamp, prior state, and updated state.

---

## 10. Deployment & Infrastructure Guidelines

### 10.1 Environment Variables
```ini
# Database Connection (Supabase Transaction Pooler - Port 6543)
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct URL for Prisma Migrations (Session Port 5432)
DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase Public & Service Keys
NEXT_PUBLIC_SUPABASE_URL="https://[REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."

# Public Application URL
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### 10.2 Production Migration Protocol
```bash
# Apply migrations to production schema safely
npx prisma migrate deploy

# Verify generation of latest Prisma client
npx prisma generate
```

> [!WARNING]
> Never execute `npx prisma db push` or `npx prisma migrate dev` directly against a production database. Always deploy reviewed migration files using `prisma migrate deploy`.

---

## 11. Initial Tenant: ፍሬ ባር እና ሬስቶራንት

The initial production rollout focuses on **ፍሬ ባር እና ሬስቶራንት** (Fre Bar & Restaurant):
- **Slug:** `fre-bar`
- **Default Currency:** Ethiopian Birr (`ETB`)
- **Languages:** Amharic (`አማርኛ`) primary, English secondary
- **Features Active (Level 1):**
  - High-res QR table menus
  - Bilingual menu categories (Tibsi, Kitfo, Beyaynetu, Drinks, Draft Beer)
  - Owner dashboard for category and product management
  - Mobile QR code download for print materials

