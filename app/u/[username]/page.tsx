import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { startDirectChat } from './actions'

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url')
    .eq('username', username.toLowerCase())
    .maybeSingle()

  if (error) {
    notFound()
  }

  if (!profile) {
    notFound()
  }

  const isMe = profile.id === user.id

  return (
    <main className="relative min-h-[calc(100vh-90px)] overflow-hidden px-4 py-6 md:px-8 md:py-10">
      <div className="orange-blob orange-float-1 left-[5%] top-[10%] h-20 w-20 md:h-28 md:w-28" />
      <div className="orange-blob orange-float-2 right-[6%] top-[16%] h-16 w-16 md:h-24 md:w-24" />

      <div className="mx-auto max-w-4xl">
        <div className="orange-glass rounded-[36px] p-5 md:p-8">
          <div className="grid gap-6 md:grid-cols-[280px_1fr]">
            <aside className="orange-glass-soft rounded-[30px] p-5">
              <div className="flex flex-col items-center text-center">
                <div className="orange-3d flex h-28 w-28 items-center justify-center overflow-hidden rounded-full">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-white">AVA</span>
                  )}
                </div>

                <div className="mt-4 text-2xl font-bold">
                  {profile.display_name || profile.username || 'Пользователь'}
                </div>

                <div className="mt-1" style={{ color: 'var(--text-muted)' }}>
                  {profile.username ? `@${profile.username}` : 'Без username'}
                </div>
              </div>
            </aside>

            <section className="orange-glass-soft rounded-[30px] p-5 md:p-6">
              <div className="orange-pill mb-4 px-4 py-2 text-sm font-medium">
                <span>●</span>
                <span>Публичный профиль</span>
              </div>

              <h1 className="text-3xl font-bold md:text-4xl">
                {profile.display_name || profile.username || 'Пользователь'}
              </h1>

              <p className="mt-4 whitespace-pre-wrap leading-8" style={{ color: 'var(--text-muted)' }}>
                {profile.bio || 'Пользователь пока ничего о себе не написал.'}
              </p>

              <div className="mt-6">
                {isMe ? (
                  <Link
                    href="/profile"
                    className="orange-button orange-secondary rounded-[22px] px-5 py-3 font-medium"
                  >
                    Редактировать профиль
                  </Link>
                ) : (
                  <form
                    action={async () => {
                      'use server'
                      await startDirectChat(profile.id)
                    }}
                  >
                    <button
                      type="submit"
                      className="orange-button orange-primary rounded-[22px] px-5 py-3 font-semibold"
                    >
                      Начать чат
                    </button>
                  </form>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}