# Render Deployment Guide - Vortex Store (Free Tier)

This application is 100% configured and optimized to run completely on **Render's Free Plan** without incurring any hosting costs.

---

## 💡 How It Works for Free on Render

1. **Unified Full-Stack Service**: The Node.js Express backend serves both the `/api/...` endpoints and the compiled React production assets (`client/dist`). Therefore, you only need **1 Free Web Service** instead of paying or consuming limits for two separate services.
2. **Free Managed PostgreSQL**: Connects to Render's free PostgreSQL database (or Neon/Supabase) with automated table migrations and default seeding on startup.
3. **Single Build & Start Commands**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

---

## 🚀 Option 1: Automatic 1-Click Deployment with Blueprint (Recommended)

Render Blueprints automate service and database provisioning using the included `render.yaml`.

1. **Push your code to GitHub**:
   - Initialize git (if not already): `git init`
   - Add and commit files: `git add . && git commit -m "Initial commit"`
   - Create a GitHub repository and push your project to it.
2. **Open Render Dashboard**:
   - Go to [dashboard.render.com](https://dashboard.render.com).
3. **Create Blueprint**:
   - Click the blue **New +** button in the top right.
   - Select **Blueprint**.
   - Connect your GitHub repository (`vortex_store`).
4. **Deploy**:
   - Render will detect `render.yaml` and configure:
     - PostgreSQL database: `vortex-db` (Free instance)
     - Web service: `vortex-store` (Free Node environment)
   - Click **Apply**.
5. Wait 2–3 minutes for the build to finish. Your store will be live on an address like:
   `https://vortex-store.onrender.com`

---

## 🛠️ Option 2: Step-by-Step Manual Deployment on Render

If you prefer setting up the database and web service manually, follow these steps:

### Step 1: Create Free PostgreSQL Database
1. In Render Dashboard, click **New +** ➔ **PostgreSQL**.
2. Configure:
   - **Name**: `vortex-db`
   - **Database**: `vortex_db`
   - **User**: `vortex_user`
   - **Region**: Frankfurt (EU Central) or your preferred region.
   - **Plan**: Select **Free**.
3. Click **Create Database**.
4. Once created, copy the **Internal Database URL** (or External Database URL if deploying across different regions).

---

### Step 2: Create Web Service for Frontend & Backend
1. In Render Dashboard, click **New +** ➔ **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `vortex-store`
   - **Region**: Same region as your database (e.g., `Frankfurt`).
   - **Branch**: `main` (or `master`).
   - **Runtime**: `Node`.
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Plan Type**: Select **Free**.

---

### Step 3: Set Environment Variables
Under the **Environment Variables** section in the Web Service setup, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production caching and optimizations |
| `PORT` | `10000` | Default port used by Render |
| `DATABASE_URL` | *(paste the PostgreSQL URL from Step 1)* | Database connection string |
| `JWT_SECRET` | `vortex_super_secure_jwt_secret_2026_change_me` | Secret key for JWT auth tokens |
| `ADMIN_EMAIL` | `admin@vortex.store` | Default super admin login email |
| `ADMIN_PASSWORD` | `admin123456` | Default super admin password |

Click **Create Web Service**.

Render will now:
1. Clone the repository.
2. Run `npm install && npm run build` (compiling the React frontend into `client/dist`).
3. Launch `server/src/server.js`.
4. Connect to PostgreSQL and automatically create all tables and initial Xbox games.
5. Provide you with your public HTTPS URL!

---

## 🔑 Default Administrator Credentials

Once deployed, visit `/login` or `/admin` on your deployed site:
- **Email**: `admin@vortex.store`
- **Password**: `admin123456`
*(You can change this password or add additional admins inside `/admin/users`).*

---

## ⚡ Testing & Verifying Your Deployment
1. Visit `https://<your-service>.onrender.com/api/health` to confirm the backend status is `"status": "healthy"`.
2. Browse the homepage to confirm game cards and multi-tier pricing render properly.
3. Test placing a sample order by selecting a game, going to `/checkout`, and uploading any payment screenshot.
4. Log into `/admin` using the admin credentials to view the order and fulfill it with Xbox credentials.
