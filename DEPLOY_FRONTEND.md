# Frontend Deployment Guide (Vercel)

This guide covers deploying the Steganography Project frontend to Vercel and the backend to Render with Neon PostgreSQL.

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub (see steps below for cleaning up secrets first).
2. **Neon Database**: Create a database on [Neon](https://neon.tech) and get your connection string.
3. **Google OAuth**: Configure OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/).

---

## Backend Deployment (Render)

### Step 1: Create a Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New** → **Web Service**.
2. Connect your GitHub repository and select the `Steganography_Project2` repo.
3. Configure the service:
   - **Name**: `steganography-backend` (or any name)
   - **Root Directory**: `backend` (or leave blank if backend is at root)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

### Step 2: Set Environment Variables on Render

Add the following environment variables in the Render dashboard:

```
DATABASE_URL=postgresql://neondb_owner:<password>@<host>/neondb?sslmode=require
JWT_SECRET=<your-secure-jwt-secret-change-this>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
FRONTEND_URL=https://<your-vercel-app>.vercel.app
NODE_ENV=production
PORT=3001
```

**Important:**
- Replace `DATABASE_URL` with your Neon connection string (rotate password after exposing in commits).
- Generate a secure `JWT_SECRET` (use `openssl rand -base64 32` or similar).
- Set `FRONTEND_URL` to your Vercel frontend URL (for CORS).
- Update Google OAuth redirect URIs in Google Cloud Console to include:
  - `https://<your-render-service>.onrender.com/auth/google/callback`
  - `https://<your-vercel-app>.vercel.app/login`

### Step 3: Deploy Backend

- Click **Create Web Service**. Render will build and deploy automatically.
- Note the service URL: `https://<your-render-service>.onrender.com`

---

## Frontend Deployment (Vercel)

### Step 1: Push Code to GitHub

Ensure your repo is pushed and secrets are removed (see cleanup steps below).

### Step 2: Create a New Project on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** → **Project**.
2. Import your GitHub repository (`Steganography_Project2`).
3. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend-temp` (important: set this to the frontend folder)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `build` (default)

### Step 3: Set Environment Variables on Vercel

Add the following environment variables in the Vercel project settings:

| Variable Name             | Value                                              |
|---------------------------|----------------------------------------------------|
| `REACT_APP_API_URL`       | `https://<your-render-service>.onrender.com`     |
| `REACT_APP_GOOGLE_CLIENT_ID` | `<your-google-client-id>` (optional, if used in frontend) |

**Notes:**
- `REACT_APP_API_URL` must point to your deployed Render backend URL.
- Environment variables in Create React App must be prefixed with `REACT_APP_`.
- Redeploy after adding env vars (Vercel may require a manual redeploy).

### Step 4: Deploy Frontend

- Click **Deploy**. Vercel will build and deploy automatically.
- Your app will be live at: `https://<your-vercel-app>.vercel.app`

---

## Post-Deployment Checklist

### 1. Update Google OAuth Settings

In [Google Cloud Console](https://console.cloud.google.com/):
- Go to **APIs & Services** → **Credentials** → Your OAuth 2.0 Client ID.
- Add **Authorized Redirect URIs**:
  - `https://<your-render-service>.onrender.com/auth/google/callback`
- Add **Authorized JavaScript Origins**:
  - `https://<your-vercel-app>.vercel.app`

### 2. Update Backend CORS

Ensure your backend `server.js` allows your Vercel frontend origin:

```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

Set `FRONTEND_URL` env var on Render to your Vercel URL.

### 3. Test the Deployment

1. Visit your Vercel frontend URL.
2. Test signup/login (email/password and Google OAuth).
3. Test encode/decode flows with an image.
4. Check browser DevTools console and Network tab for errors.

### 4. Database Migrations

Ensure the `users` table exists in Neon:
- The backend `db.js` runs `CREATE TABLE IF NOT EXISTS` on startup (auto-creates the table).
- Or manually run migrations via `psql` or the Neon dashboard SQL editor.

---

## Local Development with Environment Variables

For local dev, create `.env` files (do not commit them):

### `backend/.env`
```bash
DATABASE_URL=postgresql://neondb_owner:<password>@<host>/neondb?sslmode=require
JWT_SECRET=your_local_jwt_secret
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
PORT=3001
```

### `frontend-temp/.env`
```bash
REACT_APP_API_URL=http://localhost:3001
```

Run locally:
```bash
# Backend
cd backend
npm install
npm start

# Frontend (in another terminal)
cd frontend-temp
npm install
npm start
```

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` is set on Render backend.
- Check browser DevTools console for blocked origins.

### Google OAuth Not Working
- Verify redirect URIs in Google Cloud Console match your deployed URLs.
- Check backend logs on Render for OAuth errors.

### Database Connection Errors
- Verify `DATABASE_URL` is correct and includes `?sslmode=require`.
- Check Neon dashboard for connection limits or errors.
- Ensure `db.js` includes SSL config for Neon connections.

### Build Failures on Vercel
- Ensure root directory is set to `frontend-temp`.
- Check build logs in Vercel dashboard.
- Verify all dependencies are in `package.json`.

### API Requests Fail
- Verify `REACT_APP_API_URL` is set correctly in Vercel.
- Check Render backend logs for request errors.
- Ensure JWT tokens are being sent in Authorization headers.

---

## Security Reminders

1. **Never commit `.env` files** containing secrets.
2. **Rotate all secrets** after accidental exposure (DB password, JWT secret, OAuth secrets).
3. **Use HTTPS** in production (Vercel and Render provide this by default).
4. **Validate user input** on backend to prevent injection attacks.
5. **Set secure JWT expiry** (e.g., 24h) and implement refresh tokens for long sessions.

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Create React App Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [Express CORS Configuration](https://expressjs.com/en/resources/middleware/cors.html)
