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
- Jede Phase = eigener Branch

## Aktuelle Phase

Phase 1 – Next.js + Supabase Dashboard

## Wichtige Befehle

- Frontend: cd frontend && npm run dev
- Backend: cd backend && uvicorn main:app --reload

```

---

### 3. Erster Claude Code Prompt zum Start

Starte Claude Code im Projektordner und gib ihm diesen Prompt:
```

Ich baue PropVoice – einen KI-Sprachassistenten für Hausverwaltungen
als Portfolio-Projekt. Lies die CLAUDE.md.

Starte Phase 1:

1. Erstelle die Next.js App-Struktur unter /frontend mit TypeScript,
   Tailwind und App Router
2. Erstelle /backend als Python FastAPI Projekt mit pyproject.toml
3. Erstelle eine .env.example mit allen Supabase-Variablen die wir
   brauchen werden
4. Erstelle ein /docs/architecture.md mit einer kurzen Erklärung
   der Systemarchitektur
5. Initialisiere Git mit einer sinnvollen .gitignore

Danach erkläre mir was du gemacht hast und was der nächste
konkrete Schritt in Phase 1 ist.

```

---

### 4. So arbeitest du mit Claude Code phasenweise

**Jede Session** startet so – Claude Code liest CLAUDE.md automatisch und weiß sofort wo du stehst.

**Am Ende jeder Phase** sagst du:
```

Phase 1 ist fertig. Update die CLAUDE.md:

- Aktuelle Phase auf Phase 2 setzen
- Notiere was in Phase 1 gebaut wurde und welche
  Supabase-Tabellen existieren

```

**Wenn du feststeckst:**
```

Ich verstehe nicht wie Supabase RLS hier funktioniert.
Erkläre es mir zuerst konzeptuell, dann zeig mir die
SQL-Policy für damage_reports und erkläre jede Zeile.

```

**Für neue Konzepte (z.B. LiveKit in Phase 3):**
```

Ich kenne LiveKit noch nicht. Bevor du Code schreibst:
erkläre mir in 5 Sätzen wie LiveKit Rooms und Agents
funktionieren, dann fangen wir an.

```

---

### 5. Git-Workflow den Claude Code für dich pflegt
```

Nach jeder abgeschlossenen Aufgabe:
committe die Änderungen mit einem konventionellen
Commit-Message und erkläre mir in einem Satz was committed wurde.
