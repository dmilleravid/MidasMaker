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


