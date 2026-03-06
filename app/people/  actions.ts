'use server'

import { createClient } from '@/lib/supabase/server'

export async function searchPeople(query: string) {
  const supabase = await createClient()

  const trimmed = query.trim().toLowerCase()

  if (!trimmed) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio')
    .ilike('username', `%${trimmed}%`)
    .limit(20)

  if (error) throw new Error(error.message)

  return data || []
}