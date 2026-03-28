@AGENTS.md

# PropVoice – CLAUDE.md

## Projektbeschreibung

KI-Sprachassistent für Schadensmeldungen in Hausverwaltungen.
Mieter melden Schäden per Voice, KI transkribiert und kategorisiert.

## Tech Stack

- Frontend: Next.js 14 (App Router), TypeScript, Tailwind
- Datenbank: Supabase (PostgreSQL + RLS + Realtime)
- Backend: Python 3.12, FastAPI
- Voice: LiveKit
- Deployment: Google Cloud Run, Terraform

## Projektstruktur

/frontend → Next.js App
/backend → FastAPI Python Service
/terraform → Infra-Definitionen
/docs → Architekturentscheidungen

## Coding-Konventionen

- TypeScript: strict mode, keine any
- Python: async FastAPI, Pydantic für alle Schemas
- Git: feature branches, konventionelle Commits (feat:, fix:, docs:)

## Aktuelle Phase

Phase 3 – Voice (LiveKit)

## Was bereits existiert

### Phase 2 – Authentifizierung ✅
- Supabase Auth mit E-Mail/Passwort
- `supabase-browser.ts` + `supabase-server.ts` (getrennte Clients für SSR)
- Middleware schützt alle Routen, redirect auf `/login`
- RLS-Policy: nur `authenticated` User dürfen lesen
- Logout-Button im Dashboard

### Phase 1 – Next.js + Supabase Dashboard ✅
- Supabase-Tabelle `schadensmeldungen` (id, titel, beschreibung, kategorie, status, erstellt_am)
- RLS aktiviert, Policy: alle dürfen lesen
- `frontend/src/lib/supabase.ts` – Supabase Client (Singleton)
- `frontend/src/app/page.tsx` – Dashboard mit Statistik-Übersicht und Meldungsliste

## Wichtige Befehle

- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && uvicorn main:app --reload`
