'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

// Hört auf Änderungen in der DB und aktualisiert die Seite automatisch.
// Nützlich wenn ein Mieter eine neue Meldung einreicht während der Vermieter
// das Dashboard offen hat.
export default function RealtimeRefresher() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('schadensmeldungen-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schadensmeldungen' },
        () => router.refresh(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  return null
}
