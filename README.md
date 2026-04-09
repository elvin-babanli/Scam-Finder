# Scam Finder (Minimal)

Minimal **consent-based** visit logger, built to be simple and Render-friendly.

## Routes

- **`/`**: public page with clear consent prompt
- **`/api/log`**: stores a visit entry **only after consent**
- **`/results?key=OWNER_KEY`**: private results table (no login, just a secret key)
- **`/api/export?key=OWNER_KEY`**: download JSON export of stored entries

## What data is stored (after consent)

- IP address (from request headers)
- Approximate IP geolocation (country/region/city + org/ISP if available, via optional provider)
- Browser / OS / device type
- Language, timezone, screen size
- User agent, referrer, network type (if available)
- Timestamp

Nothing is stored if the visitor declines or closes the page.

## Storage

Entries are appended as JSON lines to:

- **`${STORAGE_DIR}/visits.jsonl`** (default: `./data/visits.jsonl`)

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Required:

- `OWNER_KEY` (secret key to access `/results` and `/api/export`)

Optional:

- `STORAGE_DIR` (default `./data`)
- `IP_GEO_PROVIDER=ipapi` (only runs after consent; uses `ipapi.co`)

## Render deployment (no Docker)

- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Set env vars: `OWNER_KEY` (required), optionally `STORAGE_DIR`, `IP_GEO_PROVIDER`

### Important note about persistence on Render

Render web services can have **ephemeral disk** depending on configuration. If you need logs to persist:

- attach a **Render persistent disk**, and set `STORAGE_DIR` to the mounted path
  - example: `/var/data`

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
