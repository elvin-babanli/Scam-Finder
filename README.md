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

**Service name:** `taploop`

| Field | Value |
|--------|--------|
| **Build command** | `npm install && npm run build` |
| **Start command** | `npm start` |

**Environment variables**

| Key | Required | Notes |
|-----|----------|--------|
| `OWNER_KEY` | **Yes** | Long random secret; unlocks `/results?key=…` and `/api/export?key=…` |
| `STORAGE_DIR` | No | Use `/var/data` when a persistent disk is mounted there (see `render.yaml`) |
| `IP_GEO_PROVIDER` | No | Set to `ipapi` for approximate IP location after consent, or omit to skip |

**Blueprint:** `render.yaml` attaches a **1 GB disk** at **`/var/data`** and sets `STORAGE_DIR=/var/data`.  
That needs a **paid** Render web instance (free tier may not support disks). If you deploy without a disk, set `STORAGE_DIR` to `./data` and accept ephemeral storage.

**Native runtime:** Set environment to **Node** if you create the service manually.
