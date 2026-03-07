import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: {
    username: string | null
    display_name: string | null
    avatar_url: string | null
  } | null = null

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', user.id)
      .single()

    profile = data || null
  }

  if (user) {
    return (
      <main className="min-h-[calc(100vh-80px)] px-6 py-10 md:px-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="glass-panel rounded-[36px] p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <section className="space-y-6">
                <div
                  className="inline-flex rounded-full px-4 py-2 text-sm font-medium"
                  style={{
                    background: 'rgba(91, 156, 255, 0.12)',
                    border: '1px solid var(--border)',
                  }}
                >
                  Добро пожаловать обратно
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl font-bold md:text-6xl">
                    Secure
                    <br />
                    Messenger
                  </h1>

                  <p
                    className="max-w-2xl text-lg leading-8"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Личная главная страница мессенджера. Отсюда можно быстро
                    перейти в чаты, найти человека, открыть профиль и продолжить переписку.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/chat"
                    className="glass-button rounded-2xl px-6 py-4 font-semibold"
                    style={{
                      background:
                        'linear-gradient(135deg, #5b9cff 0%, #7eb7ff 100%)',
                      color: 'var(--primary-text)',
                    }}
                  >
                    Открыть чаты
                  </Link>

                  <Link
                    href="/people"
                    className="glass-button rounded-2xl px-6 py-4 font-semibold"
                    style={{
                      background: 'rgba(255,255,255,0.78)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    Найти людей
                  </Link>

                  <Link
                    href="/profile"
                    className="glass-button rounded-2xl px-6 py-4 font-semibold"
                    style={{
                      background: 'rgba(255,255,255,0.78)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    Мой профиль
                  </Link>
                </div>
              </section>

              <section className="glass-soft rounded-[30px] p-5">
                <div className="mb-5 text-lg font-semibold">Твой профиль</div>

                <div className="flex items-center gap-4">
                  <div
                    className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border"
                    style={{
                      background: 'rgba(255,255,255,0.72)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        avatar
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-xl font-semibold">
                      {profile?.display_name || profile?.username || 'Пользователь'}
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      {profile?.username ? `@${profile.username}` : 'Без username'}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <Link
                    href="/chat"
                    className="glass-button rounded-2xl px-4 py-3 font-medium"
                    style={{
                      background: 'rgba(255,255,255,0.78)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    Перейти к чатам
                  </Link>

                  <Link
                    href="/profile"
                    className="glass-button rounded-2xl px-4 py-3 font-medium"
                    style={{
                      background: 'rgba(255,255,255,0.78)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    Редактировать профиль
                  </Link>

                  {profile?.username ? (
                    <Link
                      href={`/u/${profile.username}`}
                      className="glass-button rounded-2xl px-4 py-3 font-medium"
                      style={{
                        background: 'rgba(255,255,255,0.78)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      Как меня видят
                    </Link>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-80px)] px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-7">
          <div
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium"
            style={{
              background: 'rgba(91, 156, 255, 0.12)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          >
            Secure • Fast • Minimal
          </div>

          <div className="space-y-5">
            <h1 className="text-5xl font-bold leading-[0.95] md:text-6xl">
              Secure
              <br />
              Messenger
            </h1>

            <p
              className="max-w-xl text-lg leading-8 md:text-xl"
              style={{ color: 'var(--text-muted)' }}
            >
              Удобный мессенджер с личными профилями, поиском людей, чатами,
              отправкой файлов и современным стеклянным интерфейсом.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/login"
              className="glass-button inline-flex items-center justify-center rounded-2xl px-7 py-4 text-base font-semibold"
              style={{
                background:
                  'linear-gradient(135deg, #5b9cff 0%, #7eb7ff 100%)',
                color: 'var(--primary-text)',
              }}
            >
              Войти
            </Link>

            <Link
              href="/register"
              className="glass-button inline-flex items-center justify-center rounded-2xl px-7 py-4 text-base font-semibold"
              style={{
                background: 'rgba(255,255,255,0.78)',
                border: '1px solid var(--border)',
              }}
            >
              Регистрация
            </Link>
          </div>
        </section>

        <section className="glass-panel rounded-[34px] p-4 md:p-5">
          <div className="mb-4">
            <div
              className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
              style={{
                background: 'rgba(91, 156, 255, 0.12)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
            >
              Демо интерфейса
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <aside className="glass-soft rounded-[26px] p-4">
              <div className="mb-4 text-lg font-bold">Чаты</div>

              <div className="space-y-3">
                <div className="rounded-[20px] p-4" style={{ background: 'rgba(255,255,255,0.72)' }}>
                  <div className="font-semibold">Анна</div>
                  <div className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Отправила новый макет
                  </div>
                </div>

                <div className="rounded-[20px] p-4" style={{ background: 'rgba(255,255,255,0.55)' }}>
                  <div className="font-semibold">Команда</div>
                  <div className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Проверили обновление
                  </div>
                </div>
              </div>
            </aside>

            <div className="glass-soft rounded-[26px] p-4 md:p-5">
              <div className="mb-4 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                <div className="text-lg font-bold">Анна</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Защищённая переписка
                </div>
              </div>

              <div className="space-y-3">
                <div
                  className="max-w-[82%] rounded-[20px] px-4 py-3 text-[15px] leading-7"
                  style={{ background: 'rgba(255,255,255,0.72)' }}
                >
                  Привет. Я закончила обновлённый вариант интерфейса.
                </div>

                <div
                  className="ml-auto max-w-[82%] rounded-[20px] px-4 py-3 text-[15px] leading-7"
                  style={{
                    background:
                      'linear-gradient(135deg, #5b9cff 0%, #7eb7ff 100%)',
                    color: 'var(--primary-text)',
                  }}
                >
                  Отлично, сейчас посмотрю.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}