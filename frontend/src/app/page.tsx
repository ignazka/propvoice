import { createClient } from '@/lib/supabase-server'
import LogoutButton from './components/LogoutButton'

type Schadensmeldung = {
  id: string
  titel: string
  beschreibung: string | null
  kategorie: string | null
  status: string
  erstellt_am: string
}

const statusFarbe: Record<string, string> = {
  offen: 'bg-yellow-100 text-yellow-800',
  in_bearbeitung: 'bg-blue-100 text-blue-800',
  erledigt: 'bg-green-100 text-green-800',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: meldungen, error } = await supabase
    .from('schadensmeldungen')
    .select('*')
    .order('erstellt_am', { ascending: false })

  if (error) {
    return <p className="p-8 text-red-600">Fehler: {error.message}</p>
  }

  const stats = {
    offen: meldungen.filter((m: Schadensmeldung) => m.status === 'offen').length,
    in_bearbeitung: meldungen.filter((m: Schadensmeldung) => m.status === 'in_bearbeitung').length,
    erledigt: meldungen.filter((m: Schadensmeldung) => m.status === 'erledigt').length,
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Schadensmeldungen</h1>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.offen}</div>
          <div className="text-sm text-zinc-500 mt-1">Offen</div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.in_bearbeitung}</div>
          <div className="text-sm text-zinc-500 mt-1">In Bearbeitung</div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.erledigt}</div>
          <div className="text-sm text-zinc-500 mt-1">Erledigt</div>
        </div>
      </div>

      {meldungen.length === 0 ? (
        <p className="text-zinc-500">Keine Meldungen vorhanden.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {meldungen.map((m: Schadensmeldung) => (
            <li key={m.id} className="border rounded-lg p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{m.titel}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${statusFarbe[m.status] ?? 'bg-zinc-100 text-zinc-600'}`}>
                  {m.status}
                </span>
              </div>
              {m.beschreibung && (
                <p className="text-sm text-zinc-600">{m.beschreibung}</p>
              )}
              <div className="flex gap-3 text-xs text-zinc-400 mt-1">
                {m.kategorie && <span>{m.kategorie}</span>}
                <span>{new Date(m.erstellt_am).toLocaleDateString('de-DE')}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
