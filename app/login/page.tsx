import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { login } from './actions'

export default async function LoginPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/chat')
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        action={login}
        className="w-full max-w-md rounded-[32px] border p-8 bg-white shadow-xl"
      >
        <h1 className="text-3xl font-semibold mb-6">Вход</h1>

        <input
          name="email"
          type="email"
          placeholder="Почта"
          className="w-full rounded-2xl border px-4 py-3 mb-4"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Пароль"
          className="w-full rounded-2xl border px-4 py-3 mb-6"
          required
        />

        <button
          className="w-full rounded-2xl py-3 text-white font-medium mb-4"
          style={{ background: 'var(--primary)' }}
        >
          Войти
        </button>

        <div className="text-sm text-gray-600 text-center">
          Нет аккаунта? <Link href="/register" className="underline">Зарегистрироваться</Link>
        </div>
      </form>
    </main>
  )
}