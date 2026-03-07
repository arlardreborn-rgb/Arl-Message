import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export async function SiteHeader() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let username: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle()

    username = profile?.username || null
  }

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 md:px-6 md:pt-5">
      <div className="orange-glass top-shine mx-auto flex max-w-7xl items-center justify-between rounded-[28px] px-4 py-3 md:px-6">
        <Link href="/" className="orange-button shrink-0">
          <div className="text-xl font-bold md:text-2xl">ArlMessage</div>
        </Link>

        <nav className="flex max-w-[72vw] gap-2 overflow-x-auto pb-1 md:max-w-none md:gap-3">
          <Link
            href="/"
            className="orange-button orange-secondary shrink-0 rounded-2xl px-4 py-2 text-sm font-medium md:px-5 md:py-3 md:text-base"
          >
            Главная
          </Link>

          {user ? (
            <>
              <Link
                href="/chat"
                className="orange-button orange-primary shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold md:px-5 md:py-3 md:text-base"
              >
                Мои чаты
              </Link>

              <Link
                href="/people"
                className="orange-button orange-secondary shrink-0 rounded-2xl px-4 py-2 text-sm font-medium md:px-5 md:py-3 md:text-base"
              >
                Люди
              </Link>

              <Link
                href="/profile"
                className="orange-button orange-secondary shrink-0 rounded-2xl px-4 py-2 text-sm font-medium md:px-5 md:py-3 md:text-base"
              >
                Профиль
              </Link>

              {username ? (
                <Link
                  href={`/u/${username}`}
                  className="orange-button orange-secondary shrink-0 rounded-2xl px-4 py-2 text-sm font-medium md:px-5 md:py-3 md:text-base"
                >
                  Моя страница
                </Link>
              ) : null}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="orange-button orange-secondary shrink-0 rounded-2xl px-4 py-2 text-sm font-medium md:px-5 md:py-3 md:text-base"
              >
                Войти
              </Link>

              <Link
                href="/register"
                className="orange-button orange-primary shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold md:px-5 md:py-3 md:text-base"
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