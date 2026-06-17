# Influence CRM

A bilingual (Arabic/English) Influencer Relations CRM with RTL/LTR layout support, Supabase authentication and database, and full CRUD for 8 modules.

## Run & Operate

- `pnpm --filter @workspace/crm run dev` — run the CRM frontend (port 22444)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- Required env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — Supabase project credentials

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind v4 + shadcn/ui
- Routing: wouter
- State: @tanstack/react-query
- i18n: react-i18next (en + ar)
- Auth + DB: Supabase
- Charts: recharts

## Where things live

- `artifacts/crm/src/i18n/locales/en.json` — English translations
- `artifacts/crm/src/i18n/locales/ar.json` — Arabic translations
- `artifacts/crm/src/lib/supabase.ts` — Supabase client + TypeScript types
- `artifacts/crm/src/contexts/AuthContext.tsx` — Supabase auth context
- `artifacts/crm/src/contexts/LanguageContext.tsx` — RTL/LTR + font switching
- `artifacts/crm/src/components/Layout.tsx` — sidebar + header
- `artifacts/crm/src/pages/` — all 8 CRM pages
- `supabase-schema.sql` — run this in your Supabase SQL editor to create tables + RLS

## Architecture decisions

- Supabase is used as the auth provider AND database (no separate Express backend for CRM data)
- Language stored in localStorage key `crm-language`; direction applied to `<html dir="">` 
- Cairo font for Arabic, Inter for English, swapped via JS on language change
- All text uses `useTranslation()` hook with keys from en.json / ar.json
- `isSupabaseConfigured` guard in `src/lib/supabase.ts` prevents crashes when env vars are missing

## Product

8 modules:
1. **Dashboard** — stats cards + recent projects/tasks/clients
2. **Clients** — full CRUD table (name, industry, email, phone, status, notes)
3. **Influencers** — full CRUD (platform, category, city, followers, engagement rate, price)
4. **Projects** — full CRUD (linked to clients, budget, status, dates)
5. **Tasks** — full CRUD (linked to projects, priority, status, due date with overdue indicator)
6. **Calendar** — monthly grid showing task due dates and project deadlines
7. **Reports** — bar + pie charts using recharts (projects/tasks/influencers/clients)
8. **Auth** — Supabase email/password login with bilingual form

## Setup steps for Supabase

1. Create a project at supabase.com
2. Go to SQL Editor and run `supabase-schema.sql`
3. Enable email/password auth in Authentication > Settings
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` secrets
5. Create your first user via Authentication > Users > Add user

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always check `isSupabaseConfigured` before calling `supabase.*` — the client is `null` when env vars are missing
- RTL sidebar flip is handled by CSS `inset-end`/`translate-x` via Tailwind logical utilities + `dir="rtl"` on `<html>`
- Recharts needs `ResponsiveContainer` wrapper for responsive charts
