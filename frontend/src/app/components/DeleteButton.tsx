'use client'

import { useTransition } from 'react'
import { meldungLoeschen } from '@/app/actions'

export default function DeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  function loeschen() {
    if (!confirm('Meldung wirklich löschen?')) return
    startTransition(() => {
      meldungLoeschen(id)
    })
  }

  return (
    <button
      onClick={loeschen}
      disabled={pending}
      className="text-xs text-zinc-400 hover:text-red-500 disabled:opacity-40 transition-colors"
    >
      {pending ? '…' : 'Löschen'}
    </button>
  )
}
