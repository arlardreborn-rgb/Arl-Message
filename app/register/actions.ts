'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function register(formData: FormData) {
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '').trim()
  const username = String(formData.get('username') || '').trim().toLowerCase()

  if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
  throw new Error('Username должен быть только на латинице, цифрах, ., _ или -')
  }

  if (!email || !password || !username) {
    throw new Error('Заполни все поля')
  }

  const supabase = await createClient()

  

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/login')
}