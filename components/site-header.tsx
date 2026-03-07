import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export async function SiteHeader() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let username = ''

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    username = profile?.username || ''
  }

  return (
    <header
      className="border-b px-4 py-4"
      style={{
     background: 'rgba(255,255,255,0.78)',
    border: '1px solid var(--border)',
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-xl font-bold">
          Secure Messenger
        </Link>
        <nav className="flex max-w-full gap-3 overflow-x-auto pb-1"></nav>
        <nav className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="glass-button shrink-0 rounded-2xl px-4 py-2"
            style={{ background: 'var(--panel-2)', color: 'var(--text)' }}
          >
            Главная
          </Link>

          {user ? (
            <>
              <Link
                href="/chat"
                className="glass-button shrink-0 rounded-2xl px-4 py-2"
                style={{
  background: 'linear-gradient(135deg, #FF7F49 0%, #FF7F49 100%)',
  color: 'var(--primary-text)',
}}
              >
                Мои чаты
              </Link>

              <Link
                href="/people"
                className="glass-button shrink-0 rounded-2xl px-4 py-2"
                style={{ background: 'var(--panel-2)', color: 'var(--text)' }}
              >
                Люди
              </Link>

              <Link
                href="/profile"
                className="glass-button shrink-0 rounded-2xl px-4 py-2"
                style={{ background: 'var(--panel-2)', color: 'var(--text)' }}
              >
                Профиль
              </Link>

              {username ? (
                <Link
                  href={`/u/${username}`}
                  className="glass-button shrink-0 rounded-2xl px-4 py-2"
                  style={{ background: 'var(--panel-2)', color: 'var(--text)' }}
                >
                  Моя страница
                </Link>
              ) : null}

              <form action="/chat" method="get">
                <button
                  className="shrink-0 rounded-2xl px-4 py-2 font-medium"
                  style={{ background: 'var(--primary)', color: 'var(--primary-text)' }}
                >
                  Открыть чат
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="glass-button shrink-0 rounded-2xl px-4 py-2"
                style={{ background: 'var(--panel-2)', color: 'var(--text)' }}
              >
                Войти
              </Link>

              <Link
                href="/register"
                className="rounded-2xl px-4 py-2 font-medium"
                style={{ background: 'var(--primary)', color: 'var(--primary-text)' }}
              >
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}