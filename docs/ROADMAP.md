# Development Roadmap & Implementation Levels

This document outlines the delivery phases, milestones, technical deliverables, and completion status for the Restaurant Management SaaS Platform.

---

## 1. Master Delivery Matrix

```
[Level 1: Completed] ➔ [Level 2: Next] ➔ [Level 3: Q1] ➔ [Level 4: Q2] ➔ [Level 5: Q3]
```

| Phase | Milestone | Focus Area | Status |
|:---:|---|---|:---:|
| **Level 1** | **QR Digital Menu** | Profile, multilingual catalog, QR downloads, analytics | **Completed** |
| **Level 2** | **Interactive Ordering** | Cart, table QR tokens, order placement, customer status | **Completed** |
| **Level 3** | **Complete Operations** | KDS, Waiter terminal, POS, Cashier, Tables, Roles | **Completed** |
| **Level 4** | **Restaurant ERP** | Inventory, Recipe BOM, Purchases, Expenses, Reporting | **Completed** |
| **Level 5** | **Enterprise SaaS** | Multi-branch groups, Subscriptions, Platform Admin, Telebirr | **Completed** |

---

## 2. Detailed Milestone Breakdown

### Level 1 — QR Digital Menu (Current Baseline)
- [x] Next.js 14 App Router + Tailwind CSS setup
- [x] PostgreSQL database schema with Prisma ORM
- [x] Multi-tenant isolation model (`restaurantId` on all tenant entities)
- [x] Bilingual menu support (English + Amharic `አማርኛ`)
- [x] Public responsive menu view (`/menu/[slug]`)
- [x] Category filtering view (`/menu/[slug]/category/[id]`)
- [x] Protected dashboard layout with active restaurant context
- [x] Category management (create, sort order, activation)
- [x] Product catalog management (create, price, availability, sold out toggle)
- [x] QR code generation and high-res PNG download (`qrcode` package)
- [x] Anonymous menu view analytics counter (`MenuView`)
- [x] Seed script for initial flagship customer: **ፍሬ ባር እና ሬስቶራንት** (`fre-bar`)

### Level 2 — Interactive Menu & Online Ordering
- [x] Shopping cart state management with quantity steppers (`[-]` `qty` `[+]`)
- [x] Table identification & QR tokens (e.g. Table No. 20, Table No. 01)
- [x] Secure server action with server-side price recalculation (tamper-proof)
- [x] Order status lifecycle (`PENDING` ➔ `ACCEPTED` ➔ `PREPARING` ➔ `READY` ➔ `SERVED` ➔ `COMPLETED`)
- [x] Live customer order tracking screen (`/order/[id]`) with auto-refresh
- [x] Restaurant staff live orders queue (`/dashboard/orders`) with status progression controls

### Level 3 — Complete Restaurant Operations
- [x] **Kitchen Display System (KDS):** Real-time order tickets with elapsed preparation timers, delayed indicators, and stage buttons (`/dashboard/kitchen`)
- [x] **Point of Sale (POS):** Fast in-person order builder, dining mode selector (`Dine In` vs `Take Away`), table assignment, discount calculator, and receipt billing (`/dashboard/pos`)
- [x] **Payment Processing:** Multi-channel payment recording (Cash, Telebirr, Card) with transactional ledger (`Payment` model)
- [x] **Table Management:** Floor plan layouts, seating capacities, live occupancy states, and individual table QR code exports (`/dashboard/tables`)
- [x] **Staff Navigation:** Streamlined dashboard app bar with fast switching between KDS, POS, Orders, Tables, and Catalog

### Level 4 — Restaurant ERP
- [x] **Inventory Management:** Central stock ledger per branch, unit conversions (kg, g, L, pcs) (`/dashboard/inventory`)
- [x] **Recipe & Ingredient Catalog:** In-stock tracking, Amharic titles, minimum stock alerts (`/dashboard/ingredients`)
- [x] **Suppliers & Purchasing:** Purchase Orders, goods receipt auto-incrementing stock (`/dashboard/purchasing`)
- [x] **Expense Tracking:** Categorized overhead tracking (rent, payroll, utilities) (`/dashboard/expenses`)
- [x] **Financial Reporting:** Real-time Gross Margin, COGS, and estimated net profit (`/dashboard/reports`)
- [x] **ERP Dashboard:** MarketMan-style executive overview with COGS chart and waste tracking (`/dashboard/erp`)

### Level 5 — Enterprise Multi-Tenant SaaS
- [x] **Super Admin Control Center:** Tenant lifecycle management, tenant usage meters (`/admin`)
- [x] **Subscription Engine:** Tiered billing (Starter, Pro, Enterprise) with feature flags (`/admin/plans`, `/admin/subscriptions`)
- [x] **Payment Gateways:** Telebirr, CBE Birr, Chapa webhook & transaction ledger (`/admin/payments`)
- [x] **Multi-Branch Aggregation:** Consolidated reporting for restaurant groups with multiple branches (`Branch` model)
- [x] **Enterprise Security & Audit:** Platform-wide immutable audit trail (`/admin/audit`)
- [x] **Platform Analytics:** GMV, MRR, AOV, and tenant activity benchmarks (`/admin/analytics`)

