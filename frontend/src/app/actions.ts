'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function statusAendern(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('schadensmeldungen').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function notizSpeichern(id: string, notiz: string) {
  const supabase = await createClient()
  await supabase.from('schadensmeldungen').update({ notiz }).eq('id', id)
  revalidatePath('/')
}

export async function meldungLoeschen(id: string) {
  const supabase = await createClient()
  await supabase.from('schadensmeldungen').delete().eq('id', id)
  revalidatePath('/')
}
