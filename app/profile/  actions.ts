'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const username = String(formData.get('username') || '').trim().toLowerCase()

  if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
  throw new Error('Username должен быть только на латинице, цифрах, ., _ или -')
  }
  const display_name = String(formData.get('display_name') || '').trim()
  const bio = String(formData.get('bio') || '').trim()

  if (!username || !display_name) {
    throw new Error('Username и имя обязательны')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('profiles')
    .update({
      username,
      display_name,
      bio,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/profile')
  revalidatePath(`/u/${username}`)
}