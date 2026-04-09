# TapLoop

Minimal **consent-based** session log. **Supabase Postgres** is the primary store (works on **Render free tier** without a disk). In-memory buffer is **fallback only** if Supabase is misconfigured or briefly unavailable.

## Routes

- **`/`** — TapLoop home (tap **Start** to consent, save session, then play a short tap-to-jump mini game)
- **`POST /api/log`** — append one session row (after consent)
- **`/results?key=OWNER_KEY`** — private list (newest first)
- **`GET /api/export?key=OWNER_KEY`** — JSON download (`taploop-sessions.json`)

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL → New query** → paste and run the script in **`supabase/visits.sql`** (creates `public.visits` + index).
3. **Project Settings → API**:
   - Copy **Project URL** → `SUPABASE_URL`
   - Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only; keep secret)

Do **not** expose the service role key in the browser. This app only uses it in **server** routes and server components.

## Local

```bash
npm install
cp .env.example .env
# fill OWNER_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

## Render

| Setting | Value |
|--------|--------|
| **Name** | `taploop` |
| **Build command** | `npm install && npm run build` |
| **Start command** | `npm start` |
| **Runtime** | Node |

**Environment variables** — set in the Render dashboard (or use Blueprint `render.yaml` and paste secrets when prompted):

| Key | Required |
|-----|----------|
| `OWNER_KEY` | Yes |
| `SUPABASE_URL` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes |

`SUPABASE_ANON_KEY` is **not required** for this codebase.

Geo lookups use **[ipapi.co](https://ipapi.co)** server-side (`/json/` per visitor IP). Failed or rate-limited responses are stored as **`unknown`** (never null) so the app keeps running.

## Data stored (only after **Start**)

IP, approximate location / org (or `unknown`), browser, OS, device type, language, timezone, screen size, user agent, referrer, network type when available, timestamp.

## Blueprint

`render.yaml` uses **`plan: free`** and **no persistent disk** — persistence is entirely in Supabase.
