# Scam Finder

Production-minded, **consent-based** scam investigation dashboard + public diagnostic page.

## What this app does

- **Admin dashboard (single-admin)**:
  - Create/edit/delete cases
  - Add suspected profiles (URL + platform)
  - Add timeline events
  - Save transcript entries (manual)
  - Save suspicious payment/account details (manual)
  - Add evidence notes/links + **upload screenshots/files**
  - Link accepted public diagnostic sessions to a case
  - Export a professional **PDF report per case**
  - View an **audit log** of admin actions

- **Public diagnostic page** (`/public/diagnostic/[token]`):
  - Shows clear consent screen
  - **Stores nothing until the visitor clicks Accept**
  - After acceptance stores: IP, approximate IP geo (if available), ISP/org (if available), browser/OS/device basics, language/timezone/screen, UA/referrer/platform/network type, timestamp
  - Optional separate opt-ins (disabled by default): **precise geolocation**, **camera test**, **microphone test**

## Safety & privacy (important)

- No spyware, no hidden tracking, no fingerprinting, no credential capture.
- Public diagnostics are **explicit-consent only**.
- Optional permissions (geo/camera/mic) are **separate opt-in** and only requested after acceptance.
- No third-party scripts on the frontend.

## Tech stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- NextAuth (Credentials provider)
- PDFKit (server-side PDF export)

## Local setup

### 1) Install dependencies

```bash
npm install
```

### 2) Create `.env`

Copy `.env.example` to `.env` and fill in values.

Required env vars:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_APP_URL`

Optional:

- `STORAGE_DIR` (default `./data`)
- `IP_GEO_PROVIDER=ipapi` (only used after visitor acceptance)

### 3) Run migrations

```bash
npm run prisma:deploy
```

Or during development:

```bash
npm run prisma:migrate
```

### 4) Seed demo data (creates/updates the admin user)

```bash
npm run seed
```

### 5) Start dev server

```bash
npm run dev
```

Visit:

- Home: `http://localhost:3000`
- Admin login: `http://localhost:3000/login`

## Build

```bash
npm run build
npm start
```

## Render deployment

### Option A: Blueprint (`render.yaml`)

1. Push this repo to GitHub.
2. In Render: **New → Blueprint** and select the repo.
3. Create a Render Postgres database and set `DATABASE_URL` (Render provides it).
4. Set env vars:
   - `NEXTAUTH_URL` (your Render URL)
   - `NEXTAUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL` (same as `NEXTAUTH_URL`)
5. Deploy. Render will run:
   - Build: `npm ci && npm run prisma:generate && npm run build`
   - Start: `npm run prisma:deploy && npm start`

### Option B: Manual Web Service

- Build Command: `npm ci && npm run prisma:generate && npm run build`
- Start Command: `npm run prisma:deploy && npm start`

## Notes on storage

Uploads and PDF exports are written to `STORAGE_DIR` (default `./data`).
For production durability on Render, configure a persistent disk or move storage to an object store (S3, etc.).

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
