# 🎮 Vortex Store - Xbox Games Account Store ("Play More .. Pay Less")

A comprehensive, full-stack web application designed for selling **Xbox Series X|S** and **Xbox One** game accounts. Built with a cyberpunk neon dark UI, multi-tier account pricing (Sign, Home, and Full accounts), offline payment proof verification (InstaPay & Mobile Wallets), and an administrative fulfillment panel to securely deliver Xbox account credentials to customers.

Engineered and optimized 100% for **Render's Free Tier** using a unified Node.js/Express service + **PostgreSQL**.

---

## 🌟 Key Features

### 1. Customer Storefront
- **Authentic Game Cover Art**: Every game features official high-definition cover art loaded directly on-demand via direct CDN/web URLs without consuming local disk space or repository storage.
- **3 Account Pricing Tiers per Game**:
  - 🎮 **Sign Account**: Budget-friendly option to play directly on the provided Xbox profile.
  - 🏠 **Home Account**: Most popular option; activated once as "My Home Xbox" to play from your personal profile with online/offline achievements.
  - 👑 **Full Account**: Complete ownership; full access to change email, password, and security info.
- **Fast Search & Filter**: Real-time instant search by title, category, and price.
- **Smart Shopping Cart**: Local persistence, quantity adjustments, and automatic total in EGP.
- **Checkout & Payment Verification**:
  - Displays **InstaPay** address and **Vodafone Cash, Orange Cash, and Etisalat Cash** wallet numbers with 1-click copy buttons.
  - Receipt screenshot upload to verify transactions.
  - Generates a unique order ID format: `VTX-XXXXX`.
  - Direct WhatsApp support link with pre-filled order details.
- **Order Tracking & Delivery**:
  - Live timeline tracking (Pending 🕒 ➔ In Progress ⚙️ ➔ Completed ✅).
  - **Secure Credentials Box**: When the order is marked completed by an admin, customers see their Xbox Account Email, Password, and step-by-step setup guide with 1-click copy buttons.
- **How It Works Guide**: Visual explanation of Sign vs Home vs Full accounts and step-by-step setup instructions for Xbox Series X|S and Xbox One.
- **Authentication**: Google Sign-In (OAuth) + Email/Password authentication.

### 2. Admin Management Panel (`/admin`)
- **Dashboard Overview**: Total revenue in EGP, order status breakdown, active game count, and registered users.
- **Order Fulfillment**:
  - Review customer payment screenshots in a full-screen preview.
  - Deliver Xbox account credentials (Email, Password, Custom Instructions) per game item.
- **Game Catalog Management**:
  - Add new games by providing their direct **Image URL** (Steam CDN, Xbox Store, RAWG, etc.) with a **live instant visual preview**.
  - No local image storage needed—images are fetched on-the-fly by customer browsers.
  - Modify Sign/Home/Full pricing, toggle stock, or delete games.
- **Bulk Excel/CSV Import**:
  - Upload `.xlsx` or `.csv` sheets with `Image_Url` columns to batch-create or update games and pricing.
  - Downloadable template included (`vortex_store_games_template.xlsx`).
- **Multi-Admin Management**: Invite new administrators or promote existing customers to Admins.
- **Store & Payment Settings**: Update InstaPay address, mobile wallet numbers, WhatsApp support contact, and top announcement banner directly from the dashboard.

---

## 🔐 Administrator Credentials

| Field | Value | Notes |
| :--- | :--- | :--- |
| **Admin Portal** | `http://localhost:5000/login` or `/admin` | Live on web service |
| **Email** | `admin@vortex.store` | Super Admin account |
| **Password** | `V0rt3x$2026#Admin!Xb0x` | Complex high-security password |

> **Note**: A 1-click **"Demo Admin ⚡"** button is also available on the `/login` page for fast testing.

---

## 🏗️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router 6, Axios, @react-oauth/google.
- **Backend**: Node.js, Express, `pg` (PostgreSQL client with SSL connection pool), JWT, Bcryptjs, Multer, xlsx.
- **Database**: PostgreSQL (with automated schema migrations and local dev fallback).
- **Deployment**: Single Express service hosting both API and compiled React SPA assets, fitting within Render's free tier.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
# Install root, server, and client dependencies
npm install
cd client && npm install && cd ..
```

### 2. Build the Frontend
```bash
npm run build
```

### 3. Start the Application
```bash
npm start
```
The store will be running at: **`http://localhost:5000`**

---

## 🌐 Deploy to Render (Free Tier)

For step-by-step instructions with screenshots and environment variable details, see [RENDER_DEPLOY_GUIDE.md](./RENDER_DEPLOY_GUIDE.md).

### Quick Blueprint Deploy:
1. Push this project to your GitHub repository.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** ➔ **Blueprint**.
3. Connect your repository. Render automatically reads `render.yaml` to deploy:
   - Free PostgreSQL Database (`vortex-db`)
   - Free Web Service (`vortex-store`)
4. Click **Apply**.
