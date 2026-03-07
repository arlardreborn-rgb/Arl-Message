'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function startDirectChat(otherUserId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  if (!otherUserId) {
    throw new Error('Не передан пользователь для чата')
  }

  if (otherUserId === user.id) {
    throw new Error('Нельзя создать чат с самим собой')
  }

  const { data, error } = await supabase.rpc('find_or_create_direct_dialog', {
    other_user_id: otherUserId,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('Не удалось создать или найти диалог')
  }

  redirect(`/chat?dialog=${data}`)
}