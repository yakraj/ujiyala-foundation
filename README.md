
# Ujiyala Foundation

Elegant, secure, and production-ready financial management for small NGOs.

Ujiyala Foundation pairs a modern React + Vite + Tailwind front-end with a robust Node.js + Express + MongoDB back-end to provide a complete solution for membership, donations, receipts, expenses, and role-driven approval workflows.

Why this project
- Built for transparency: role-based approvals and accountant-verified receipts ensure checks and balances.
- Privacy-first: only authorized roles see sensitive records.
- Practical: PDF receipts, image uploads, and mobile-first UI streamline day-to-day operations.
- Extensible: modular code and clear routes make integrations straightforward.

Key features
- Role-based admin accounts (president, secretary, accountant, vice_president, member)
- Member request workflow: members request → president & secretary approve → accountant confirms payment and issues receipts
- Donation tracking with categories, accountant verification, and PDF receipts
- Expense recording (accountant-only) with optional receipt images
- Mobile-first dashboard with remaining balance, totals, and quick actions
- File uploads (Cloudinary-ready middleware) and server-side PDF generation
- Security: Helmet, CORS, rate limiting, Zod validation, JWT auth, and error handling

Tech stack
- Frontend: React, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express, Mongoose (MongoDB)
- Auth: JSON Web Tokens (jsonwebtoken)
- Validation: Zod
- PDF generation: pdfkit

Quick start (development)

1) Clone

```bash
git clone <repo-url>
cd ujiyala-foundation
```

2) Backend

PowerShell (Windows):
```powershell
cd server
cp .env.example .env
# Edit .env and set MONGODB_URI, JWT_SECRET, ORIGIN, CLOUDINARY_* if used
npm install
npm run dev   # runs with node src/start.js
```

Unix / macOS:
```bash
cd server
cp .env.example .env
# edit .env
npm install
npm run dev
```

Create the first admin (PowerShell example):
```powershell
Invoke-RestMethod -Uri http://localhost:4000/api/auth/register-admin -Method POST -ContentType 'application/json' -Body (@{ name='Admin'; email='admin@ujiyala.org'; password='ChangeMe!123' } | ConvertTo-Json)
```

3) Frontend
```powershell
cd ../client
cp .env.example .env
# optionally set VITE_API_BASE to http://localhost:4000/api for local dev
npm install
npm run dev   # opens at http://localhost:5173
```

Core API endpoints
- POST /api/auth/register-admin — bootstrap admin accounts (protect this in prod)
- POST /api/auth/login — login to receive JWT
- POST /api/members/requests — submit membership request
- POST /api/members/requests/:id/approve — president/secretary approve
- POST /api/members/requests/:id/confirm-payment — accountant confirms and creates a member
- GET /api/donations/pending — pending donations (accountant)
- POST /api/donations/:id/verify — accountant verifies donation and generates receipt

Operational notes
- Always set a strong JWT_SECRET in production.
- Set ORIGIN in the server `.env` to your frontend origin to restrict CORS.
- Use a durable object store (S3 or Cloudinary) for uploads in production.
- Protect `register-admin` once bootstrapped — or only run it locally to create initial users.
- The server includes console.debug logs for important flows; replace with a structured logger for production.

Privacy and safety
- Sensitive data and unapproved requests are filtered server-side so only the intended roles can retrieve them.
- Endpoints enforce role-based access; client-side checks are for convenience and UX only.

Extending the app
- Want new donation categories, export formats, or integration with accounting software? The codebase is modular and welcomes extensions. Add new routes under `server/src/routes/` and services under `server/src/services/`.

Contributing
- PRs and issues welcome. Include clear reproduction steps and tests where possible.

License
- This repository is maintained for Ujiyala Foundation. Add a LICENSE file as appropriate for your use.

Contact & credits
- Built with care to help NGOs operate transparently and efficiently.

---

© Ujiyala Foundation
