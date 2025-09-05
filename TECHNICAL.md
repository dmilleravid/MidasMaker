# Technical Conventions

## Auth
- JWT with `JWT_SECRET` in env.
- Payload: `{ id, role }`. Roles: `admin`, `user`.

## RBAC
- Middleware enforces role via `requireRole(["admin"])` or `["admin","user"]`.

## Linting & Formatting
- ESLint and Prettier configured at root and per app as needed.

## Env Vars
- `DATABASE_URL`, `JWT_SECRET`, `VERCEL_ENV`.
- Google OAuth:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REDIRECT_URI` (e.g., http://localhost:3001/api/auth/google/callback)
  - `NEXT_PUBLIC_API_BASE_URL` (e.g., http://localhost:3001)


