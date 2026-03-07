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
      .maybeSingle()

    profile = data || null
  }

  if (user) {
    return (
      <main className="relative min-h-[calc(100vh-90px)] overflow-hidden px-4 py-6 md:px-8 md:py-10">
        <div className="orange-blob orange-float-1 top-[8%] left-[3%] h-28 w-28 md:h-40 md:w-40" />
        <div className="orange-blob orange-float-2 right-[6%] top-[18%] h-24 w-24 md:h-32 md:w-32" />
        <div className="orange-blob orange-float-3 bottom-[10%] left-[12%] h-20 w-20 md:h-28 md:w-28" />

        <div className="mx-auto max-w-7xl">
          <div className="orange-glass card-pop relative overflow-hidden rounded-[38px] p-5 md:p-8">
            <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <section className="relative z-10">
                <div className="orange-pill mb-5 px-4 py-2 text-sm font-medium">
                  <span>●</span>
                  <span>Добро пожаловать обратно</span>
                </div>

                <h1 className="max-w-3xl text-4xl font-bold leading-[0.92] md:text-6xl">
                  Яркий
                  <br />
                  быстрый
                  <br />
                  оранжевый мессенджер
                </h1>

                <p
                  className="mt-5 max-w-2xl text-base leading-8 md:text-xl"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Твоя главная панель управления. Быстро переходи в чаты, открывай профиль,
                  находи людей и продолжай переписку в более живом, современном и насыщенном интерфейсе.
                </p>

                <div className="mt-7 flex flex-wrap gap-4">
                  <Link
                    href="/chat"
                    className="orange-button orange-primary rounded-2xl px-6 py-4 text-base font-semibold md:px-7"
                  >
                    Открыть чаты
                  </Link>

                  <Link
                    href="/people"
                    className="orange-button orange-secondary rounded-2xl px-6 py-4 text-base font-semibold md:px-7"
                  >
                    Найти людей
                  </Link>

                  <Link
                    href="/profile"
                    className="orange-button orange-secondary rounded-2xl px-6 py-4 text-base font-semibold md:px-7"
                  >
                    Мой профиль
                  </Link>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="orange-glass-soft rounded-[26px] p-5">
                    <div className="mb-2 text-lg font-bold">Живо</div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      Анимации, стекло, глубина и мягкие тени в одном стиле.
                    </div>
                  </div>

                  <div className="orange-glass-soft rounded-[26px] p-5">
                    <div className="mb-2 text-lg font-bold">Быстро</div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      Быстрые переходы между чатами и удобная навигация.
                    </div>
                  </div>

                  <div className="orange-glass-soft rounded-[26px] p-5">
                    <div className="mb-2 text-lg font-bold">Стильно</div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      Тёплая оранжевая палитра с современным glossy-эффектом.
                    </div>
                  </div>
                </div>
              </section>

              <section className="relative z-10">
                <div className="orange-glass-soft top-shine rounded-[34px] p-4 md:p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="orange-3d flex h-16 w-16 items-center justify-center overflow-hidden rounded-full"
                    >
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-white">YOU</span>
                      )}
                    </div>

                    <div>
                      <div className="text-xl font-bold">
                        {profile?.display_name || profile?.username || 'Пользователь'}
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>
                        {profile?.username ? `@${profile.username}` : 'Профиль пользователя'}
                      </div>
                    </div>
                  </div>

                  <div className="orange-glass-soft rounded-[28px] p-4">
                    <div className="mb-3 text-lg font-bold">Быстрые действия</div>

                    <div className="grid gap-3">
                      <Link
                        href="/chat"
                        className="orange-button orange-primary rounded-2xl px-4 py-3 font-semibold"
                      >
                        Перейти к чатам
                      </Link>

                      <Link
                        href="/people"
                        className="orange-button orange-secondary rounded-2xl px-4 py-3 font-medium"
                      >
                        Найти нового собеседника
                      </Link>

                      <Link
                        href="/profile"
                        className="orange-button orange-secondary rounded-2xl px-4 py-3 font-medium"
                      >
                        Редактировать профиль
                      </Link>

                      {profile?.username ? (
                        <Link
                          href={`/u/${profile.username}`}
                          className="orange-button orange-secondary rounded-2xl px-4 py-3 font-medium"
                        >
                          Как меня видят другие
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 rounded-[28px] p-4 orange-glass-soft">
                    <div className="mb-3 text-lg font-bold">Демо настроения</div>

                    <div className="space-y-3">
                      <div className="rounded-[20px] px-4 py-3" style={{ background: 'rgba(255,255,255,0.75)' }}>
                        <div className="font-semibold">Анна</div>
                        <div style={{ color: 'var(--text-muted)' }}>Прислала обновлённый интерфейс</div>
                      </div>

                      <div
                        className="ml-auto max-w-[84%] rounded-[20px] px-4 py-3 text-white"
                        style={{
                          background:
                            'linear-gradient(135deg, #ff7a1a 0%, #ff9747 58%, #ffb36d 100%)',
                        }}
                      >
                        Отлично, выглядит уже заметно круче.
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-[calc(100vh-90px)] overflow-hidden px-4 py-6 md:px-8 md:py-10">
      <div className="orange-blob orange-float-1 left-[2%] top-[10%] h-28 w-28 md:h-44 md:w-44" />
      <div className="orange-blob orange-float-2 right-[5%] top-[8%] h-24 w-24 md:h-32 md:w-32" />
      <div className="orange-blob orange-float-3 bottom-[8%] right-[16%] h-20 w-20 md:h-28 md:w-28" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative z-10">
          <div className="orange-pill mb-6 px-4 py-2 text-sm font-medium">
            <span>●</span>
            <span>Orange glass messenger</span>
          </div>

          <h1 className="text-5xl font-bold leading-[0.9] md:text-7xl">
            Arl
            <br />
            Message
          </h1>

          <p
            className="mt-6 max-w-2xl text-lg leading-8 md:text-xl"
            style={{ color: 'var(--text-muted)' }}
          >
            Современный мессенджер с тёплой оранжевой палитрой, стеклянными панелями,
            анимациями кнопок, личными профилями, чатами и приятным визуальным характером.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="orange-button orange-primary rounded-2xl px-7 py-4 text-base font-semibold"
            >
              Войти
            </Link>

            <Link
              href="/register"
              className="orange-button orange-secondary rounded-2xl px-7 py-4 text-base font-semibold"
            >
              Регистрация
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="orange-glass-soft rounded-[26px] p-5">
              <div className="mb-2 text-lg font-bold">Glass</div>
              <div style={{ color: 'var(--text-muted)' }}>
                Мягкие панели, прозрачность и свет.
              </div>
            </div>

            <div className="orange-glass-soft rounded-[26px] p-5">
              <div className="mb-2 text-lg font-bold">Motion</div>
              <div style={{ color: 'var(--text-muted)' }}>
                Анимации на кнопках и интерфейсных элементах.
              </div>
            </div>

            <div className="orange-glass-soft rounded-[26px] p-5">
              <div className="mb-2 text-lg font-bold">Depth</div>
              <div style={{ color: 'var(--text-muted)' }}>
                Объёмные акценты и тёплый премиальный стиль.
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10">
          <div className="orange-glass top-shine relative rounded-[38px] p-4 md:p-5">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/25 blur-2xl" />
            <div className="absolute -left-8 bottom-10 h-28 w-28 rounded-full bg-orange-300/30 blur-3xl" />

            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
              <aside className="orange-glass-soft rounded-[28px] p-4">
                <div className="mb-4 text-lg font-bold">Чаты</div>

                <div className="space-y-3">
                  <div className="rounded-[22px] p-4" style={{ background: 'rgba(255,255,255,0.78)' }}>
                    <div className="font-semibold">Анна</div>
                    <div className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                      Прислала новый макет
                    </div>
                  </div>

                  <div className="rounded-[22px] p-4" style={{ background: 'rgba(255,255,255,0.58)' }}>
                    <div className="font-semibold">Команда</div>
                    <div className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                      Проверили обновление
                    </div>
                  </div>
                </div>
              </aside>

              <div className="orange-glass-soft rounded-[28px] p-4 md:p-5">
                <div className="mb-4 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                  <div className="text-lg font-bold">Анна</div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    защищённая переписка
                  </div>
                </div>

                <div className="space-y-3">
                  <div
                    className="max-w-[84%] rounded-[20px] px-4 py-3 text-[15px] leading-7"
                    style={{ background: 'rgba(255,255,255,0.78)' }}
                  >
                    Привет. Я обновила вариант интерфейса, теперь он теплее и живее.
                  </div>

                  <div
                    className="ml-auto max-w-[84%] rounded-[20px] px-4 py-3 text-[15px] leading-7 text-white"
                    style={{
                      background:
                        'linear-gradient(135deg, #ff7a1a 0%, #ff9747 58%, #ffb36d 100%)',
                    }}
                  >
                    Да, вот это уже выглядит как настоящий продукт.
                  </div>

                  <div className="mt-4 flex gap-3">
                    <div
                      className="flex-1 rounded-[20px] px-4 py-3"
                      style={{ background: 'rgba(255,255,255,0.75)' }}
                    >
                      Напишите сообщение...
                    </div>

                    <button
                      className="orange-button orange-primary rounded-[20px] px-5 py-3 font-semibold"
                    >
                      Отправить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}