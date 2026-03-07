'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(_: string | null, formData: FormData) {
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    return 'Введите почту и пароль'
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('LOGIN ERROR:', error)

    if (
      error.message.toLowerCase().includes('invalid login credentials') ||
      error.code === 'invalid_credentials'
    ) {
      return 'Неверная почта или пароль. Если ты только что зарегистрировался, сначала подтверди email через письмо.'
    }

    return 'Не удалось выполнить вход. Попробуй ещё раз.'
  }

  redirect('/chat')
}