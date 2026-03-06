'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '').trim()

  if (!email || !password) {
    throw new Error('Введи почту и пароль')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('LOGIN ERROR:', error)

    if (error.message.toLowerCase().includes('invalid login credentials')) {
      throw new Error(
        'Неверная почта или пароль. Если ты только что зарегистрировался, сначала подтверди email через письмо.'
      )
    }

    if (error.message.toLowerCase().includes('email not confirmed')) {
      throw new Error('Сначала подтверди почту через письмо от Supabase')
    }

    throw new Error(error.message)
  }

  redirect('/chat')
}