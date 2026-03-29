'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const STATI = [
  { value: 'offen', label: 'Offen' },
  { value: 'in_bearbeitung', label: 'In Bearbeitung' },
  { value: 'erledigt', label: 'Erledigt' },
]

const KATEGORIEN = ['Sanitär', 'Heizung', 'Elektrik', 'Fenster', 'Sonstiges']

export default function FilterBar() {
  const router = useRouter()
  const params = useSearchParams()
  const aktiverStatus = params.get('status') ?? ''
  const aktiveKategorie = params.get('kategorie') ?? ''
  const istGefiltert = aktiverStatus || aktiveKategorie

  function setFilter(key: string, value: string) {
    const p = new URLSearchParams(params.toString())
    if (value) {
      p.set(key, value)
    } else {
      p.delete(key)
    }
    router.push(`/?${p.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <select
        value={aktiverStatus}
        onChange={e => setFilter('status', e.target.value)}
        className="text-sm px-3 py-1.5 rounded border border-zinc-200 bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
      >
        <option value="">Alle Status</option>
        {STATI.map(s => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        value={aktiveKategorie}
        onChange={e => setFilter('kategorie', e.target.value)}
        className="text-sm px-3 py-1.5 rounded border border-zinc-200 bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
      >
        <option value="">Alle Kategorien</option>
        {KATEGORIEN.map(k => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>

      {istGefiltert && (
        <button
          onClick={() => router.push('/')}
          className="text-sm px-3 py-1.5 rounded border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700"
        >
          Filter zurücksetzen
        </button>
      )}
    </div>
  )
}
