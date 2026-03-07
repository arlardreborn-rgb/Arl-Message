'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { login } from './actions'

const initialState: string | null = null

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(login, initialState)

  return (
    <main className="relative min-h-[calc(100vh-90px)] overflow-hidden px-4 py-6 md:px-8 md:py-10">
      <div className="orange-blob orange-float-1 left-[8%] top-[12%] h-24 w-24 md:h-32 md:w-32" />
      <div className="orange-blob orange-float-2 right-[8%] top-[18%] h-18 w-18 md:h-24 md:w-24" />

      <div className="mx-auto max-w-md">
        <div className="orange-glass rounded-[36px] p-6 md:p-8">
          <div className="orange-pill mb-5 px-4 py-2 text-sm font-medium">
            <span>●</span>
            <span>Вход в аккаунт</span>
          </div>

          <h1 className="mb-3 text-4xl font-bold">Войти</h1>
          <p className="mb-6 leading-8" style={{ color: 'var(--text-muted)' }}>
            Войди в свой аккаунт и продолжи переписку в оранжевом интерфейсе.
          </p>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-[20px] border px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.98)',
                  borderColor: 'var(--border)',
                }}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Пароль</label>
              <input
                name="password"
                type="password"
                required
                className="w-full rounded-[20px] border px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.98)',
                  borderColor: 'var(--border)',
                }}
              />
            </div>

            {errorMessage ? (
              <div
                className="rounded-[20px] px-4 py-3 text-sm"
                style={{
                  background: 'rgba(255, 122, 26, 0.10)',
                  border: '1px solid rgba(255, 122, 26, 0.18)',
                  color: '#9d4e11',
                }}
              >
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="orange-button orange-primary w-full rounded-[22px] px-5 py-3 font-semibold"
            >
              {isPending ? 'Входим...' : 'Войти'}
            </button>
          </form>

          <div className="mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
            Нет аккаунта?{' '}
            <Link href="/register" className="font-semibold" style={{ color: 'var(--primary)' }}>
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}