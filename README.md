# TapLoop

Minimal **consent-based** session log. Mobile-first public page + private owner view.

## Routes

- **`/`** — TapLoop home (explicit consent before any save)
- **`POST /api/log`** — append one session row after consent
- **`/results?key=OWNER_KEY`** — private list (newest first)
- **`GET /api/export?key=OWNER_KEY`** — download JSON (`taploop-sessions.json`)

## Data stored (only after user taps **Start**)

IP, approximate IP location (if `IP_GEO_PROVIDER` set), browser, OS, device type, language, timezone, screen size, user agent, referrer, network type when available, timestamp.

## Storage

- **`${STORAGE_DIR}/visits.jsonl`** (default `./data/visits.jsonl`)

On Render, disk can be ephemeral: use a **persistent disk** and point `STORAGE_DIR` at the mount path if you need retention.

## Local

```bash
npm install
cp .env.example .env
npm run dev
```

## Render

- **Build:** `npm install && npm run build` (or `npm ci && npm run build` for CI lockfile)
- **Start:** `npm start`
- **Env:** `OWNER_KEY` (required), optional `STORAGE_DIR`, `IP_GEO_PROVIDER`

Blueprint: see `render.yaml` (service name **`taploop`**).
