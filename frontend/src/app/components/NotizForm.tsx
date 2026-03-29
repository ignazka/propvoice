'use client'

import { useState, useTransition } from 'react'
import { notizSpeichern } from '@/app/actions'

export default function NotizForm({ id, notiz }: { id: string; notiz: string | null }) {
  const [text, setText] = useState(notiz ?? '')
  const [pending, startTransition] = useTransition()
  const [gespeichert, setGespeichert] = useState(false)
  const unveraendert = text === (notiz ?? '')

  function speichern() {
    if (unveraendert) return
    startTransition(async () => {
      await notizSpeichern(id, text)
      setGespeichert(true)
      setTimeout(() => setGespeichert(false), 2000)
    })
  }

  return (
    <div className="flex gap-2 mt-2">
      <input
        type="text"
        value={text}
        onChange={e => {
          setText(e.target.value)
          setGespeichert(false)
        }}
        onKeyDown={e => e.key === 'Enter' && speichern()}
        placeholder="Notiz hinzufügen (z.B. Handwerker Termin Di. 10 Uhr)"
        className="flex-1 text-sm px-2 py-1 rounded border border-zinc-200 bg-white placeholder:text-zinc-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:placeholder:text-zinc-500"
      />
      <button
        onClick={speichern}
        disabled={pending || unveraendert}
        className="text-xs px-3 py-1 rounded bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-40 whitespace-nowrap dark:bg-zinc-600 dark:hover:bg-zinc-500"
      >
        {gespeichert ? 'Gespeichert' : 'Speichern'}
      </button>
    </div>
  )
}
