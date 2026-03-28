# PropVoice – Systemarchitektur

## Überblick

Mieter melden Schäden per Voice. Die KI transkribiert und kategorisiert die Meldung automatisch. Hausverwalter sehen alle Meldungen im Dashboard.

## Komponenten

```
Browser (Mieter)
  → LiveKit Room (Audio-Stream)
    → Python Backend (FastAPI)
      → OpenAI Whisper (Transkription)
      → Supabase (Speicherung)
        → Next.js Dashboard (Hausverwalter)
```

## Services

| Service    | Technologie          | Zweck                        |
|------------|----------------------|------------------------------|
| Frontend   | Next.js 16, Tailwind | Dashboard + Voice-UI         |
| Backend    | Python, FastAPI      | Transkription, Kategorisierung |
| Datenbank  | Supabase (PostgreSQL)| Datenspeicherung + Auth      |
| Voice      | LiveKit              | Audio-Streaming (Phase 3)    |
| Infra      | Terraform, Cloud Run | Deployment                   |

## Supabase Tabellen (geplant)

- `damage_reports` – Schadensmeldungen mit Status, Kategorie, Transkription
- `properties` – Verwaltete Immobilien
- `tenants` – Mieterdaten (via Supabase Auth)
