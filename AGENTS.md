# AGENTS.md

Instructions for coding agents working on this repository. Follow these rules unless a later user message explicitly overrides them.

## Project purpose

This is a two-day technical assessment: a **Project Management System** (web + mobile) with one shared REST API and PostgreSQL database.

The authoritative requirements are:

- [docs/Intern_Task_Full_Stack_Developer.pdf](docs/Intern_Task_Full_Stack_Developer.pdf)
- [docs/PHASE_0_ARCHITECTURE_PLAN.md](docs/PHASE_0_ARCHITECTURE_PLAN.md)

Do not invent requirements. If something is not in the PDF, implement it only when the Phase 0 plan labels it a **Recommendation** and it is needed for correctness, security, or demonstrability. Use test data only; never real personal data.

## Approved technology stack

- **Web:** React, TypeScript, Vite, React Router
- **Mobile:** React Native, Expo, TypeScript, React Navigation
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL, Prisma ORM
- **Validation:** Zod (backend; clients also validate forms)
- **Auth:** bcrypt password hashing, JWT (`Authorization: Bearer`)
- **API:** REST under `/api`
- **API testing:** Postman (not curl/Thunder Client as the primary method)
- **Deploy:** Railway PostgreSQL + Railway API (primary); Render fallback; Vercel for web

## Architecture principles

- One monorepo: `apps/api`, `apps/web`, `apps/mobile`.
- One backend and one database for both clients. Never add a mobile-specific API or second database.
- Clients are presentation only. Authorization is enforced in API services, not only in the UI.
- Layers in `apps/api`: routes → controllers → services → Prisma. Controllers do not query the database. Routes stay thin.
- Ownership: `projects.user_id` is the owner. Task access follows `task.project.user_id`. Never trust a client-supplied `userId`.
- Missing or foreign resources: return **404**, not 403 (do not leak that another user’s row exists).
- Stateless JWT logout (client discards token). No refresh tokens, denylist, or RBAC unless explicitly requested.

## Coding principles

- Prefer correctness, security, maintainability, and a clear demo over extra features.
- TypeScript throughout. Keep names obvious. Avoid clever abstractions.
- Match existing folder structure and patterns once they exist.
- Fail fast on missing required environment variables.
- Log HTTP requests on the API (assessment requires logging). Do not log passwords, tokens, or hashes.
- Small phases: finish and verify one slice before starting the next.

## Security requirements

- Hash passwords with bcrypt. Never store or return plaintext passwords or `password_hash`.
- Protect all routes except register, login, and any health check. Require JWT on the rest, including logout and `/api/auth/me`.
- Validate every mutating and query payload on the backend with Zod (required fields, email, dates, non-empty strings, enums).
- Use Prisma only for data access. No concatenated SQL and no `$queryRaw` with user strings.
- Rate-limit authentication endpoints (login and register) by IP.
- CORS allowlist: local web origin and the deployed Vercel origin. Do not use `*`.
- JWT secret and expiry from env. Default expiry 24 hours. Do not put tokens in query strings.
- Use Helmet and disable `X-Powered-By` on the API.

## Database principles

- Normalized schema: `users` → `projects` → `tasks`. UUID primary keys.
- Foreign keys with `ON DELETE CASCADE` (user → projects, project → tasks).
- No `user_id` on `tasks`; ownership is via the project.
- Store enums in the database (`NOT_STARTED`, etc.); map to PDF labels in API DTOs.
- `email` unique and stored lowercase.
- Project `start_date`/`end_date` and task `due_date` required on create; `end_date >= start_date`.
- Indexes as in Phase 0. Migrations via Prisma only.

## API principles

Both clients must use these endpoints:

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET|POST /api/projects`, `GET|PUT|DELETE /api/projects/:id`
- `GET|POST /api/tasks`, `GET|PUT|DELETE /api/tasks/:id`
- `GET /api/dashboard`

Do not add nested `/api/projects/:id/tasks` unless asked. List filters use query params (`search`, `status`, `priority`, `projectId`). Create tasks with `projectId` in the body.

**Recommendation in use:** JSON shape `{ data }` on success and `{ error: { message, details? } }` on failure.

Verify API slices with **Postman** before building UI.

## Frontend / mobile principles

- Web: full project CRUD, task CRUD, dashboard, search/filter, loading and error states, responsive layout. Persist JWT in `localStorage`.
- Mobile (Android-first): auth, dashboard, view projects and their tasks, task create/edit/delete/complete/status/priority, task search/filter, pull-to-refresh. **No project CRUD on mobile.**
- Mobile token storage: `expo-secure-store` only (Keystore/Keychain). Never AsyncStorage for the JWT.
- Expired/invalid token: clear session, return to login, show a clear message.
- No network: show a clear message; do not crash or render a blank screen.
- Same account and same API on web and mobile; changes appear on the other client after refresh.

## Testing expectations

- Primary verification: Postman collections against the API (auth, ownership 404s, filters, dashboard).
- Bonus automated tests are optional; do not spend assessment time on them unless asked or there is leftover time after a working demo.
- After UI work, verify the demo path: register → create project on web → create task on mobile → see it on web after refresh.

## Important restrictions

Do **not** implement unless the user explicitly asks: Docker, CI/CD, pagination, sorting, audit logs, RBAC, refresh tokens, push notifications, offline mobile cache, shared types package, iOS-only polish, a second backend.

Do not start implementation phases until the user names them (P1, P2, …). Phase 0 is planning only.

## Scope discipline

Change only files needed for the current task. Do not refactor unrelated code, do not restyle the whole repo, and do not add drive-by features or documentation the user did not ask for.
