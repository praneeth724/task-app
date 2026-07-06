# Task Tracker

A full-stack task tracker with authentication, role-based access control (RBAC), pagination/filtering,
and real-time updates — built with **Next.js (TypeScript)** on the frontend and **Express (TypeScript)**
on the backend.

## Tech Stack

| Layer        | Choice                                                              |
| ------------ | -------------------------------------------------------------------- |
| Frontend     | Next.js 14 (App Router), TypeScript, TailwindCSS, TanStack Query, socket.io-client |
| Backend      | Node.js, Express, TypeScript, Zod validation, JWT auth, bcrypt        |
| Database     | PostgreSQL via Prisma ORM                                             |
| Real-time    | Socket.IO (rooms per user + an `admins` room)                        |
| Testing      | Jest + Supertest (backend), Jest + React Testing Library (frontend)   |
| CI/CD        | GitHub Actions (lint + test on every push/PR), deploy-hook CD to Render + Vercel |
| Containers   | Docker + docker-compose (Postgres, backend, frontend)                |

## Project Structure

```
apps/
  backend/          Express + TypeScript API
    src/
      config/        env, prisma client, socket.io setup
      modules/        auth, tasks, users (routes -> controller -> service -> dto)
      middleware/     authenticate, authorize, validate, errorHandler
      common/         AppError, pagination helper, shared types
    prisma/           schema.prisma, migrations, seed script
    tests/            Supertest integration tests + unit tests
  frontend/          Next.js (App Router) + TypeScript
    app/              routes: /login, /register, /tasks, /tasks/[id]
    components/       TaskList, TaskForm, TaskFilters, Pagination, AuthGuard, Navbar
    lib/              API client, auth context, socket client
    hooks/            useTasks, useUsers, useTaskSocket
    __tests__/        React Testing Library tests
postman/              Postman collection + environment
.github/workflows/    CI (lint/test) and CD (deploy hooks) pipelines
docker-compose.yml    One-command local stack (Postgres + backend + frontend)
```

## Setup Instructions

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 16 (or use `docker-compose` to run it for you)

### 1. Clone and install

```bash
git clone <repo-url>
cd task-app
npm install
```

This installs dependencies for both `apps/backend` and `apps/frontend` via npm workspaces.

### 2. Environment configuration

Copy the example env files and fill in values:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

**`apps/backend/.env`**

| Variable            | Description                                              |
| ------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`      | Postgres connection string                                  |
| `TEST_DATABASE_URL` | Separate Postgres DB/schema used only by the test suite      |
| `JWT_SECRET`        | Secret used to sign JWTs — set to a long random string       |
| `JWT_EXPIRES_IN`    | Access token lifetime (default `1d`)                         |
| `CORS_ORIGIN`       | Comma-separated list of allowed frontend origins             |
| `PORT`              | Port the API listens on (default `4000`)                     |

**`apps/frontend/.env`**

| Variable               | Description                          |
| ----------------------- | --------------------------------------- |
| `NEXT_PUBLIC_API_URL`   | Base URL of the backend API              |

### 3. Database setup

Start Postgres (skip if you already have one running locally):

```bash
docker compose up -d postgres
```

Run migrations and seed demo data:

```bash
npm run prisma:migrate --workspace apps/backend
npm run prisma:seed --workspace apps/backend
```

The seed creates two accounts (password `Password123!` for both):

- `admin@tasktracker.dev` — ADMIN role
- `user@tasktracker.dev` — USER role

### 4. Run the app

```bash
npm run dev:backend    # http://localhost:4000
npm run dev:frontend   # http://localhost:3000
```

### Run everything with Docker instead

```bash
docker compose up --build
```

This builds and runs Postgres, the backend (running `prisma migrate deploy` on boot), and the frontend.

### Tests

```bash
npm test                                  # both workspaces
npm run test --workspace apps/backend     # Supertest integration + unit tests (needs TEST_DATABASE_URL)
npm run test --workspace apps/frontend    # React Testing Library
```

### Linting

```bash
npm run lint
```

## API Documentation

Import both files from `postman/` into Postman:

- `TaskTracker.postman_collection.json`
- `TaskTracker.postman_environment.json` (select it as the active environment)

Run **Auth → Login (regular user)** and **Auth → Login (admin - seeded)** first — their test scripts
automatically populate `{{userToken}}` / `{{adminToken}}` / `{{userId}}` for the rest of the collection.
The **Tasks (as Admin / RBAC)** folder includes negative-case requests demonstrating the 401/403 behavior.

## Design Decisions

- **Ownership model**: every task has a single `ownerId`. `USER` role can only read/write their own
  tasks (enforced in `tasks.service.ts`, not just at the route layer, so it can't be bypassed by adding
  a new route). `ADMIN` role bypasses ownership checks entirely and can optionally assign a task's owner
  on create.
- **Auth token transport**: JWT is returned in the response body and sent back as an
  `Authorization: Bearer <token>` header, not an httpOnly cookie. This avoids cross-site cookie
  complications between the Vercel-hosted frontend and Render-hosted backend (different domains) and
  keeps the auth flow simple to reason about and test. See "Future Improvements" for the tradeoff.
- **Real-time updates**: Socket.IO connections authenticate with the same JWT (passed via
  `socket.handshake.auth.token`) and join a `user:<id>` room, plus an `admins` room if applicable. Task
  mutations emit to the owner's room and the `admins` room, so the UI updates live without a page
  refresh and without leaking events to unrelated users.
- **Validation**: all request bodies/queries/params are parsed through Zod schemas in a single
  `validate()` middleware, so invalid input is rejected before it reaches business logic, with a
  consistent `{ message, errors }` shape and correct HTTP status codes.
- **Monorepo**: npm workspaces keep the frontend and backend in one repository (per the submission
  instructions) while still allowing each app to be built, linted, and deployed independently.

## Assumptions

- A user can only ever be `USER` or `ADMIN`; there is no self-service way to become an admin — admin
  accounts are provisioned directly in the database (see the seed script).
- "Owner" filtering on the task list is only meaningful for `ADMIN` (a `USER`'s tasks are always
  scoped to themselves regardless of the `owner` query parameter).
- Soft-deletes were out of scope; task deletion is permanent.
- Test database and app database are assumed to be separate schemas/DBs to avoid the test suite wiping
  development data.

## Future Improvements

- Move from a single long-lived JWT to a short-lived access token + httpOnly refresh token pair.
- Add optimistic UI updates for task mutations instead of relying solely on query invalidation.
- Add rate limiting / brute-force protection on the auth endpoints.
- Add end-to-end tests (Playwright) covering the full register → login → CRUD → real-time flow.
- Support bulk task actions and richer filtering (search by title, filter by due date range).

## Deployment

- **Backend**: Docker image deployed to [Render](https://render.com) with a managed Postgres instance;
  `prisma migrate deploy` runs automatically on container start.
- **Frontend**: deployed to [Vercel](https://vercel.com), configured with `NEXT_PUBLIC_API_URL` pointing
  at the deployed backend.
- **CD**: `.github/workflows/cd.yml` runs after CI succeeds on `main` and calls the Render/Vercel deploy
  hooks (configured as `RENDER_DEPLOY_HOOK_URL` / `VERCEL_DEPLOY_HOOK_URL` repository secrets).

Live URLs:

- Frontend: _TODO — add after deployment_
- Backend: _TODO — add after deployment_
