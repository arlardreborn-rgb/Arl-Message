'use client'

import { useActionState } from 'react'
import { login } from './actions'

const initialState: string | null = null

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(login, initialState)

  return (
    <main className="min-h-screen px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto max-w-md">
        <div
          className="rounded-[32px] border p-6 md:p-8"
          style={{
            background: 'rgba(255,255,255,0.72)',
            borderColor: 'var(--border)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <h1 className="mb-6 text-3xl font-bold">Вход</h1>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                className="w-full rounded-2xl border px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.78)',
                  borderColor: 'var(--border)',
                }}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Пароль</label>
              <input
                name="password"
                type="password"
                className="w-full rounded-2xl border px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.78)',
                  borderColor: 'var(--border)',
                }}
                required
              />
            </div>

            {errorMessage ? (
              <div
                className="rounded-2xl px-4 py-3 text-sm"
                style={{
                  background: 'rgba(255, 99, 99, 0.12)',
                  border: '1px solid rgba(255, 99, 99, 0.22)',
                  color: '#b42318',
                }}
              >
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-2xl px-5 py-3 font-medium"
              style={{
                background: 'linear-gradient(135deg, #5b9cff 0%, #79b2ff 100%)',
                color: '#fff',
              }}
            >
              {isPending ? 'Входим...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}