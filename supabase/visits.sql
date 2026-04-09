-- Run in Supabase SQL Editor (Project → SQL → New query)

create extension if not exists "pgcrypto";

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  client_ts timestamptz not null,
  ip text not null,
  country text,
  region text,
  city text,
  org text,
  browser text,
  os text,
  device_type text,
  language text,
  timezone text,
  screen_width integer,
  screen_height integer,
  user_agent text,
  referrer text,
  network_type text,
  platform text,
  inserted_at timestamptz not null default now()
);

create index if not exists visits_client_ts_desc_idx on public.visits (client_ts desc);

-- Optional: tighten access. Service role (used by this app server-side) bypasses RLS.
-- alter table public.visits enable row level security;

comment on table public.visits is 'TapLoop consent-based session rows (server inserts via service role).';
