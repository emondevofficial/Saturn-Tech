# Saturn Tech BD — Modern E-Commerce Platform & Business Management Suite

Official computer hardware and electronics retail e-commerce platform for **Saturn Tech BD** (Chattogram, Bangladesh).

Official Facebook Page: [https://www.facebook.com/saturntechbd](https://www.facebook.com/saturntechbd)

---

## 🌟 Key Highlights & Architecture

1. **Customer-Facing Storefront**
   - High-performance, anti-AI-slop design system crafted for Bangladeshi technology retail.
   - Dynamic Hero campaign carousel with generated high-resolution assets.
   - Live search with instant dropdown auto-complete suggestions.
   - Flash Deals with real-time countdown timer.
   - Comprehensive multi-filter catalog (Category, Brand, Price Range, In-Stock, Processor, RAM, Storage, GPU, Sorting).
   - Side-by-side specification comparison matrix for up to 4 products.
   - Persistent Cart with real stock limit validation and instant coupon discounts.
   - Wishlist with one-click move-to-cart.

2. **Official Payment Integration**
   - **Cash on Delivery (COD)**: Supports nationwide address formatting and instant order placement.
   - **SSLCOMMERZ Payment Gateway**: Full official integration supporting bKash, Nagad, Rocket, Upay, Visa, MasterCard, and internet banking.
   - Server-side transaction verification (`/validator/api/validationserverAPI.php`), idempotency checks to prevent double stock decrements, and automated stock deduction on validated payment.
   - Built-in **SSLCOMMERZ Sandbox Simulator** for instant verification and sandbox testing without live merchant keys.

3. **Complete Administration Suite (`/admin`)**
   - **Overview Dashboard**: Real-time sales metrics, order counts, customer metrics, low-stock warnings, and Recharts analytics (7-day revenue trend, payment distribution pie chart, recent orders).
   - **Product Management**: Full CRUD, image uploads, specification groups, stock adjustments, and product duplication.
   - **Order Management**: Status workflows (`PENDING` → `CONFIRMED` → `PROCESSING` → `PACKED` → `SHIPPED` → `DELIVERED`), payment updates, internal notes, and printable tax invoice generator (`window.print`).
   - **Inventory Audit & Movement**: Real-time stock counts, threshold alerts, manual stock adjustments with reason logging (`PURCHASE`, `SALE`, `RETURN`, `ADJUSTMENT`, `CANCELLATION`).
   - **Customer Management**: User spend statistics, order history, account status toggling.
   - **Coupons & Promos**: Percentage & Fixed coupons, minimum spend requirements, expiry dates, and usage limits.
   - **Review Moderation**: Star ratings, comments, verified buyer badges, and approval toggles.
   - **Banners & Content**: Dynamic hero slides, FAQs, and business policies.
   - **Reports & Analytics**: Daily sales, product volume, and 1-click CSV export (`/api/admin/reports/export-csv`).

---

## 💻 Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts.
- **Backend**: Node.js, Express, REST Route Handlers.
- **Database & Persistence**:
  - Direct MongoDB / Mongoose support when `MONGODB_URI` is provided.
  - Seamless embedded JSON persistence engine (`data/store.json`) when `MONGODB_URI` is omitted, ensuring 100% functionality out-of-the-box.
- **Security & Auth**: JWT tokens (`jsonwebtoken`), password hashing (`bcryptjs`), Role-Based Access Control (`CUSTOMER`, `ADMIN`, `STAFF`, `MANAGER`), Zod validation.
- **Payments**: SSLCOMMERZ Official API v4, Cash on Delivery.

---

## 📁 Folder Structure

```
├── data/                       # Embedded JSON database persistence
├── server/
│   ├── routes/
│   │   ├── admin.ts            # Admin dashboard, products, orders, inventory CRUD
│   │   ├── auth.ts             # Register, login, profile, password reset
│   │   ├── brands.ts           # Public brands API
│   │   ├── categories.ts       # Public categories API
│   │   ├── content.ts          # Banners, FAQs, settings API
│   │   ├── coupons.ts          # Coupon validation engine
│   │   ├── orders.ts           # Order placement, tracking, customer history
│   │   ├── payment.ts          # SSLCOMMERZ callbacks, IPN, server validation
│   │   ├── products.ts         # Product catalog, multi-filter query, auto-suggestions
│   │   ├── reviews.ts          # Product reviews & verified purchaser check
│   │   └── upload.ts           # Image upload route with Cloudinary fallback
│   ├── auth.ts                 # JWT signing, verification, and role middleware
│   ├── db.ts                   # Resilient data layer supporting Mongo and local store
│   ├── seedData.ts             # Initial Bangladesh tech retail catalog
│   ├── seed.ts                 # CLI seed script
│   └── sslcommerz.ts           # Official SSLCOMMERZ integration & sandbox simulator
├── src/
│   ├── assets/                 # Generated high-resolution banners and assets
│   ├── components/             # Header, Footer, ProductCard, CartDrawer, QuickViewModal
│   ├── context/                # AuthContext, CartContext, WishlistContext, CompareContext, ToastContext
│   ├── pages/                  # HomePage, ProductsPage, ProductDetailsPage, CartPage, CheckoutPage, etc.
│   ├── admin/                  # AdminPortal & administrative views with Recharts
│   ├── types/                  # Shared TypeScript interfaces
│   ├── App.tsx                 # Root application & client router
│   ├── main.tsx                # Client entry point
│   └── index.css               # Global typography & print rules
├── server.ts                   # Full-stack server entry with Vite middleware
├── .env.example                # Documented environment variables
└── package.json
```

---

## 🔑 Default Administrator Credentials

To access the Admin Portal (`/admin`):
- **Email**: `admin@saturntechbd.com`
- **Password**: `Admin@123456`
- **Role**: `ADMIN`

*(A quick "Auto-fill Admin Credentials" button is also provided on `/login` for seamless evaluation.)*

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Initial Database
```bash
npm run seed
```

### 3. Start Development Server
```bash
npm run dev
```
The server will run on `http://localhost:3000`.

---

## 💳 SSLCOMMERZ Configuration

Configure these environment variables in your deployment:

```env
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false  # Set to true for live production merchant account
```

### Merchant Dashboard Callback & IPN URLs:
- **Success URL**: `https://<YOUR_DOMAIN>/api/payment/sslcommerz/success`
- **Fail URL**: `https://<YOUR_DOMAIN>/api/payment/sslcommerz/fail`
- **Cancel URL**: `https://<YOUR_DOMAIN>/api/payment/sslcommerz/cancel`
- **IPN URL**: `https://<YOUR_DOMAIN>/api/payment/sslcommerz/ipn`
