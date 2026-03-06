import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/chat')
  }

  return (
    <main className="min-h-[calc(100vh-80px)] px-6 py-10 md:px-10 md:py-14">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-7">
          <div
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium"
            style={{
              background: 'rgba(244, 162, 97, 0.12)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          >
            Secure • Fast • Minimal
          </div>

          <div className="space-y-5">
            <h1
              className="text-5xl font-bold ... md:text-6xl"
              style={{ color: 'var(--text)' }}
            >
              Secure
              <br />
              Messenger
            </h1>

            <p
              className="max-w-xl text-lg leading-8 md:text-xl"
              style={{ color: 'var(--text-muted)' }}
            >
              Удобный мессенджер с личными профилями, поиском людей, чатами,
              отправкой файлов и приятным современным интерфейсом.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl px-7 py-4 text-base font-semibold transition hover:scale-[1.02]"
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-text)',
                boxShadow: '0 16px 40px rgba(244, 162, 97, 0.28)',
              }}
            >
              Войти
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-2xl px-7 py-4 text-base font-semibold transition hover:scale-[1.02]"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
            >
              Регистрация
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div
              className="rounded-[24px] p-4"
              style={{
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="text-lg font-bold">Профили</div>
              <div className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                Имя, username, описание и аватар
              </div>
            </div>

            <div
              className="rounded-[24px] p-4"
              style={{
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="text-lg font-bold">Чаты</div>
              <div className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                Быстрые личные переписки и сообщения
              </div>
            </div>

            <div
              className="rounded-[24px] p-4"
              style={{
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="text-lg font-bold">Файлы</div>
              <div className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                Изображения, документы и вложения
              </div>
            </div>
          </div>
        </section>

        <section
          className="rounded-[34px] p-4 shadow-2xl md:p-5"
          style={{
            background: 'rgba(255,255,255,0.78)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 30px 80px rgba(120, 90, 60, 0.12)',
          }}
        >
          <div className="mb-4">
            <div
              className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
              style={{
                background: 'rgba(244, 162, 97, 0.12)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
            >
              Демо интерфейса
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <aside
              className="rounded-[26px] p-4"
              style={{ background: 'var(--panel)' }}
            >
              <div className="mb-4 text-lg font-bold">Чаты</div>

              <div className="space-y-3">
                <div
                  className="rounded-[20px] p-4"
                  style={{ background: 'var(--panel-2)' }}
                >
                  <div className="font-semibold">Анна</div>
                  <div className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Отправила новый макет
                  </div>
                </div>

                <div
                  className="rounded-[20px] p-4"
                  style={{ background: 'rgba(255,255,255,0.58)' }}
                >
                  <div className="font-semibold">Команда</div>
                  <div className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Проверили обновление
                  </div>
                </div>

                <div
                  className="rounded-[20px] p-4"
                  style={{ background: 'rgba(255,255,255,0.58)' }}
                >
                  <div className="font-semibold">Алексей</div>
                  <div className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Написал 5 минут назад
                  </div>
                </div>
              </div>
            </aside>

            <div
              className="rounded-[26px] p-4 md:p-5"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <div
                className="mb-4 border-b pb-3"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="text-lg font-bold">Анна</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Защищённая переписка
                </div>
              </div>

              <div className="space-y-3">
                <div
                  className="max-w-[82%] rounded-[20px] px-4 py-3 text-[15px] leading-7"
                  style={{ background: 'var(--panel)' }}
                >
                  Привет. Я закончила обновлённый вариант интерфейса.
                </div>

                <div
                  className="ml-auto max-w-[82%] rounded-[20px] px-4 py-3 text-[15px] leading-7"
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--primary-text)',
                  }}
                >
                  Отлично, сейчас посмотрю. Выглядит уже очень приятно.
                </div>

                <div
                  className="max-w-[82%] rounded-[20px] px-4 py-3 text-[15px] leading-7"
                  style={{ background: 'var(--panel)' }}
                >
                  Дальше можно найти человека, открыть его профиль и начать чат.
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <div
                  className="flex-1 rounded-[18px] px-4 py-3"
                  style={{
                    background: 'var(--panel)',
                    color: 'var(--text-muted)',
                  }}
                >
                  Напишите сообщение...
                </div>

                <button
                  className="rounded-[18px] px-5 py-3 font-semibold"
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--primary-text)',
                  }}
                >
                  Отправить
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}