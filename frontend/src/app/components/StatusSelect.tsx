'use client'

import { useState, useTransition } from 'react'
import { statusAendern } from '@/app/actions'

const STATI = [
  { value: 'offen', label: 'Offen', farbe: 'bg-yellow-100 text-yellow-800' },
  { value: 'in_bearbeitung', label: 'In Bearbeitung', farbe: 'bg-blue-100 text-blue-800' },
  { value: 'erledigt', label: 'Erledigt', farbe: 'bg-green-100 text-green-800' },
]

export default function StatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition()
  const [aktuell, setAktuell] = useState(status)
  const farbe = STATI.find(s => s.value === aktuell)?.farbe ?? 'bg-zinc-100 text-zinc-600'

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const neu = e.target.value
    setAktuell(neu)
    startTransition(async () => {
      await statusAendern(id, neu)
    })
  }

  return (
    <select
      value={aktuell}
      onChange={onChange}
      disabled={pending}
      className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer disabled:opacity-50 ${farbe}`}
    >
      {STATI.map(s => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  )
}
