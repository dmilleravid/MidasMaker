# Development Setup

## Prereqs
- Node.js 18+
- Postgres (local or managed)

## Install
- Web: `cd apps/web && npm install`
- API: `cd apps/api && npm install`
- Mobile: `cd apps/mobile && npm install`

## Env
- Copy `.env.example` to `.env` at repo root. Update `DATABASE_URL`, `JWT_SECRET`.
- For easy dev auth, `VERCEL_ENV=development` enables API auth bypass.
- Set `NEXT_PUBLIC_API_BASE_URL` to `http://localhost:3001`.
- Set `EXPO_PUBLIC_API_BASE_URL` to `http://<your-LAN-IP>:3001` (not localhost). Example: `http://192.168.1.104:3001`.

## Run
- API: `npm run dev:api` (port 3001)
- Web: `npm run dev:web` (port 3000)
- Mobile: `npm run dev:mobile`

## Testing
- API: `cd apps/api && npm test`
- Web/Mobile: add tests with Jest/React Testing Library as needed

## Seed Data
- Ensure your local DB is configured in `apps/api/.env`.
- Run: `cd apps/api && npm run seed`
- Sample accounts:
  - Admin: `admin@example.com` / `password123`
  - User: `user@example.com` / `password123`


