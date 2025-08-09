# ISCO TECH – Job Board Platform

Robust full‑stack job board where seekers browse & apply to jobs and admins manage postings & application lifecycles.

</div>

## Table of Contents
1. Overview
2. Stack & Architecture
3. Features
4. Data Model
5. API Overview
6. Frontend Structure
7. Local Development
8. Testing
9. Security Practices
10. Environment Variables
11. Migrations & Seeding
12. Roadmap / Next Steps
13. License

---

## 1. Overview
The Job Board Platform enables:
* Users (job seekers) to register, log in, browse/filter job listings, and submit a single application per job (cover letter + CV upload or URL).
* Admins to create, update, archive, and review jobs, promote users to admins, and manage application statuses (pending, reviewed, accepted, rejected).

No ORMs are used; persistence relies on raw SQL over SQLite for transparency and portability.

## 2. Stack & Architecture
Backend (Node.js + Express): REST API, JWT auth, sqlite3, raw SQL migrations & seed data.
Frontend (React + Vite): React 19, Redux Toolkit, React Router, Axios. Vanilla CSS (no UI framework) for responsive layouts.
Testing: Jest + Supertest for backend integration & unit tests; Vitest + Testing Library for frontend components.
Auth: Stateless JWT (stored in localStorage) with role-based middleware (user / admin).

Repository layout:
```
backend_jobboard/
	server.js
	src/ (controllers, routes, middleware)
	db/ (schema.sql, seed.sql, database.db, init.js)
frontend_jobboard/
	src/ (features, components, pages, store)
```

## 3. Features
### Authentication
* Register (default role=user)
* Login issuing JWT
* Role promotion (admin can promote user)
* Protected admin & user routes

### Job Listings
* Public listing with basic filters (title, location, tags) & pagination
* Detailed job view
* Admin CRUD (create, update, archive/soft delete, list archived)

### Applications
* Single application per job per user (enforced via UNIQUE constraint)
* Upload CV file (served from /uploads) or provide link (implementation supports file storage path)
* Admin can view per job or all applications and update statuses

### Frontend UX
* Responsive layout (mobile → desktop)
* Redux Toolkit slice for auth state persisted in localStorage
* Protected routes (redirect if unauthorized)

### Non-Functional
* Lightweight dependency footprint
* Modular separation (controllers/middleware/routes)
* Raw SQL for predictable performance & transparency

## 4. Data Model
Simplified (see `backend_jobboard/db/schema.sql`):
```
users(id, username UNIQUE, password_hash, role['user'|'admin'])
jobs(id, title, company_name, company_description, job_description, location,
		 requirements, salary, tags CSV, deadline, is_archived, date_posted)
applications(id, job_id FK, user_id FK, cover_letter, cv_url, application_date,
						 status['pending'|'reviewed'|'accepted'|'rejected'], UNIQUE(job_id,user_id))
```

## 5. API Overview
Base URL: `http://localhost:3001/api`

Auth:
* `POST /auth/register` – Create user
* `POST /auth/login` – Authenticate, returns `{ token, user }`

Jobs (public):
* `GET /jobs` – List jobs (supports query params: `title`, `location`, `tags`, `page`, `limit` if implemented)
* `GET /jobs/:id` – Job detail

Jobs (user):
* `POST /jobs/:id/apply` – Apply to job (JWT required)

Jobs (admin):
* `POST /jobs` – Create
* `GET /jobs/admin/all` – List all (incl archived)
* `GET /jobs/admin/all-applications` – List all applications across jobs
* `PUT /jobs/:id` – Update job
* `DELETE /jobs/:id` – Archive (soft delete)
* `GET /jobs/:id/applications` – Applications for job
* `PUT /jobs/applications/:appId` – Update application status

Users (admin):
* `GET /users` – List users
* `PUT /users/:id/promote` – Promote to admin

Middleware flow: `protect` (JWT verification) + optional `admin` guard where needed. Errors handled centrally by `errorMiddleware`.

## 6. Frontend Structure
Key areas (inside `frontend_jobboard/src`):
* `app/store.js` – Redux store configuration
* `features/auth/authSlice.js` – Auth async thunks & reducer
* `components/` – Reusable UI elements (placeholder directory)
* `pages/` – Route-level components (login, register, listings, details, admin dashboard, etc.)
* `services/api.js` – Axios instance (not shown above but expected) configured with base URL & token injection

Routing concept:
* Public: Home / Job listings / Job detail
* Authenticated: Apply form
* Admin-only: Job management dashboard, applications overview

State persistence: On login, user + token stored in localStorage and rehydrated in `authSlice` initialState.

## 7. Local Development
### Prerequisites
* Node.js 18+ (recommended)
* npm (bundled with Node)

### 1. Clone
```
git clone https://github.com/FabHaguma/job-board-system.git
cd job-board-system
```

### 2. Backend Setup
```
cd backend_jobboard
npm install
```
Create `.env`:
```
PORT=3001
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
```
Initialize database (creates / resets tables & seeds sample data):
```
node db/init.js
```
Run server (dev):
```
npm start
```
Server runs at `http://localhost:3001`.

### 3. Frontend Setup
In a second terminal:
```
cd frontend_jobboard
npm install
npm run dev
```
Visit `http://localhost:5173` (Vite default) or the printed URL.

### 4. Default Credentials
From seed data (`db/seed.sql`):
* Admin: `admin / admin123`
* User: `test / test123`

## 8. Testing
### Backend Tests
Located in `backend_jobboard/tests` (unit & integration).
Run:
```
cd backend_jobboard
npm test
```
Coverage:
```
npm run test:coverage
```

### Frontend Tests
Located in `frontend_jobboard/tests`.
Run:
```
cd frontend_jobboard
npm test
```

## 9. Security Practices
* Helmet for baseline HTTP headers.
* CORS configured (currently open – tighten for production).
* Passwords hashed via bcryptjs.
* JWT signed with `JWT_SECRET`, validated in `protect` middleware.
* Role-based authorization layered (`admin` middleware).
* Input validation & sanitization with `express-validator` (see validation middleware files).
* Foreign keys + cascading deletes enforce referential integrity.

Production Hardening Suggestions:
* Rate limiting (e.g., express-rate-limit)
* Enhanced logging / audit trails
* HTTPS termination & secure cookie fallback option

## 10. Environment Variables
Example `.env` (backend):
```
PORT=3001
JWT_SECRET=replace_me
JWT_EXPIRES_IN=7d
```
Add any further config (e.g., CORS whitelist) as needed. Frontend may optionally use a `.env` with `VITE_API_URL=http://localhost:3001/api` and use it in Axios base URL.

## 11. Migrations & Seeding
Initial schema + seed: `node db/init.js` (drops & recreates tables – do NOT run in production without backups).
Subsequent migration pattern: create `migration_XX.sql` and execute via a small runner (e.g., `run-migration.js` demonstrates usage). Consider a migrations table to track applied scripts if expanding.

## 12. Roadmap / Next Steps
Potential enhancements:
* Pagination & filtering parameters fully implemented (currently conceptual; ensure query handling in controller).
* File storage abstraction / S3 integration.
* Application activity log & timestamps for status changes.
* Admin dashboard UI polish (sorting, search, status filters).
* Internationalization & accessibility audits.
* Deployment workflows (GitHub Actions) + containerization (Dockerfile for backend & multi-stage build for frontend).
* Switch from localStorage to HttpOnly cookies for JWT (mitigate XSS risks) + refresh token rotation.

## 13. License
This project is licensed under the ISC License – see `LICENSE` for details.

---
Contributions & feedback welcome. Open an issue or create a PR to propose improvements.
