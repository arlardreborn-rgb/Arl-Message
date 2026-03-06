'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function sendMessage(formData: FormData) {
  const dialogId = String(formData.get('dialogId') || '')
  const body = String(formData.get('body') || '').trim()

  if (!dialogId || !body) return

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('messages').insert({
    dialog_id: dialogId,
    sender_id: user.id,
    body,
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/chat?dialog=${dialogId}`)
}