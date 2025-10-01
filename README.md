# Ujiyala Foundation — Financial Management Webapp (Production-Ready)

Full-stack app: **React (Vite + Tailwind)** frontend + **Node.js/Express** backend + **MongoDB**.
Features:
- Mobile-first dashboard (Remaining Balance, Total Donations, Membership Total, quick links)
- Auth (admin) with JWT
- CRUD for **Members**, **Donations**, **Expenses**
- File uploads (expense receipts image)
- **PDF receipt generation** for new member registrations and donations
- Robust middleware: Helmet, CORS, Rate limit, Validation (Zod), Error handling, Logging (Winston)
- Organized monorepo-style: `/client`, `/server`

## Quick Start

1. **MongoDB**: Have a MongoDB connection string ready.
2. **Backend**
   ```bash
   cd server
   cp .env.example .env
   # edit .env with your values
   npm install
   npm run dev   # or: npm start
   ```
3. **Create first admin user**
   ```bash
   curl -X POST http://localhost:4000/api/auth/register-admin      -H "Content-Type: application/json"      -d '{"name":"Admin","email":"admin@ujiyala.org","password":"ChangeMe!123"}'
   ```
4. **Frontend**
   ```bash
   cd ../client
   cp .env.example .env
   # Adjust VITE_API_BASE if needed
   npm install
   npm run dev  # starts on http://localhost:5173
   ```

> Login with the admin credentials you created.

## Production Notes
- Set strong `JWT_SECRET` and correct `ORIGIN` in server `.env`.
- Behind a reverse proxy, ensure `app.set('trust proxy', 1)`.
- Use a dedicated object storage (S3, etc.) for uploads in production (this build uses local `/uploads`).

## Folder Structure
```
ujiyala-foundation/
  client/
  server/
```

---

© Ujiyala Foundation
