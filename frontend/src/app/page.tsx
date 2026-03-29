import { Suspense } from 'react'
import { createClient } from '@/lib/supabase-server'
import LogoutButton from './components/LogoutButton'
import StatusSelect from './components/StatusSelect'
import NotizForm from './components/NotizForm'
import FilterBar from './components/FilterBar'
import RealtimeRefresher from './components/RealtimeRefresher'
import DeleteButton from './components/DeleteButton'

type Schadensmeldung = {
  id: string
  titel: string
  beschreibung: string | null
  kategorie: string | null
  status: string
  erstellt_am: string
  notiz: string | null
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; kategorie?: string }>
}) {
  const { status: filterStatus, kategorie: filterKategorie } = await searchParams
  const supabase = await createClient()

  // Statistik immer über alle Meldungen (ungefiltert)
  const { data: alleMeldungen } = await supabase
    .from('schadensmeldungen')
    .select('status')

  const stats = {
    offen: alleMeldungen?.filter(m => m.status === 'offen').length ?? 0,
    in_bearbeitung: alleMeldungen?.filter(m => m.status === 'in_bearbeitung').length ?? 0,
    erledigt: alleMeldungen?.filter(m => m.status === 'erledigt').length ?? 0,
  }

  // Gefilterte Liste
  let query = supabase
    .from('schadensmeldungen')
    .select('*')
    .order('erstellt_am', { ascending: false })

  if (filterStatus) query = query.eq('status', filterStatus)
  if (filterKategorie) query = query.eq('kategorie', filterKategorie)

  const { data: meldungen, error } = await query

  if (error) {
    return <p className="p-8 text-red-600">Fehler: {error.message}</p>
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <RealtimeRefresher />

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

      {/* FilterBar braucht useSearchParams → Suspense-Boundary nötig */}
      <Suspense fallback={<div className="h-10 mb-6" />}>
        <FilterBar />
      </Suspense>

      {meldungen.length === 0 ? (
        <p className="text-zinc-500">Keine Meldungen gefunden.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {meldungen.map((m: Schadensmeldung) => (
            <li key={m.id} className="border rounded-lg p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{m.titel}</span>
                <StatusSelect id={m.id} status={m.status} />
              </div>

              {m.beschreibung && (
                <p className="text-sm text-zinc-600">{m.beschreibung}</p>
              )}

              <div className="flex items-center justify-between mt-1">
                <div className="flex gap-3 text-xs text-zinc-400">
                  {m.kategorie && <span>{m.kategorie}</span>}
                  <span>{new Date(m.erstellt_am).toLocaleDateString('de-DE')}</span>
                </div>
                <DeleteButton id={m.id} />
              </div>

              {m.notiz && (
                <p className="text-sm text-zinc-500 italic mt-1">{m.notiz}</p>
              )}
              <NotizForm id={m.id} notiz={m.notiz} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
