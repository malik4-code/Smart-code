---
name: Influence CRM Architecture
description: Key decisions for the Supabase-backed bilingual CRM in artifacts/crm
---

## Auth + Database
- Supabase client-side (no Express for CRM data). `isSupabaseConfigured` guard prevents crashes before credentials are set.
- `supabase-schema.sql` in repo root must be run in Supabase SQL Editor before the app works.

## i18n
- `react-i18next`, translations in `src/i18n/locales/en.json` and `ar.json`.
- Language saved to `localStorage` key `crm-language`. Init happens in `src/i18n/index.ts` before React renders.
- RTL: set `document.documentElement.dir = "rtl"` in `LanguageContext.tsx`. Cairo font for Arabic, Inter for English.

## Supabase tables
- profiles, clients, influencers, projects, project_influencers (junction), tasks
- All have RLS policies allowing any authenticated user full CRUD.
- `handle_new_user()` trigger auto-creates a profile row on signup.

**Why:** Frontend-only Supabase approach avoids Express boilerplate for a pure CRUD app. All data ops happen via `@supabase/supabase-js` client.

**How to apply:** Any new table needs an RLS policy + addition to `supabase-schema.sql`. Any new text needs both `en.json` and `ar.json` keys.
