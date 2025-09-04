# MidasMaker

A monorepo with Web (Next.js), Mobile (Expo), and API (Express + Prisma).

## Quickstart

- Install: run `npm install` in each app directory (or use workspace scripts when set)
- Dev servers:
  - Web: `npm run dev:web`
  - API: `npm run dev:api`
  - Mobile: `npm run dev:mobile`
- Env: copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`.

## Stack

- Next.js + Tailwind (apps/web)
- Expo + NativeWind + expo-router (apps/mobile)
- Express + Prisma + Postgres (apps/api)
- Jest, ESLint, Prettier


