import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const query = (q || '').trim().toLowerCase()

  let profilesQuery = supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url')
    .neq('id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  if (query) {
    profilesQuery = profilesQuery.or(
      `username.ilike.%${query}%,display_name.ilike.%${query}%`
    )
  }

  const { data: profiles } = await profilesQuery

  return (
    <main className="relative min-h-[calc(100vh-90px)] overflow-hidden px-4 py-6 md:px-8 md:py-10">
      <div className="orange-blob orange-float-1 left-[6%] top-[8%] h-20 w-20 md:h-28 md:w-28" />
      <div className="orange-blob orange-float-2 right-[5%] top-[14%] h-16 w-16 md:h-24 md:w-24" />

      <div className="mx-auto max-w-6xl">
        <div className="orange-glass rounded-[36px] p-5 md:p-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="orange-pill mb-4 px-4 py-2 text-sm font-medium">
                <span>●</span>
                <span>Поиск собеседников</span>
              </div>

              <h1 className="text-4xl font-bold md:text-5xl">Люди</h1>
              <p className="mt-3 max-w-2xl leading-8" style={{ color: 'var(--text-muted)' }}>
                Найди пользователя по username или имени и быстро перейди на его страницу, чтобы
                начать чат.
              </p>
            </div>

            <form className="w-full md:max-w-md">
              <input
                name="q"
                defaultValue={query}
                placeholder="Поиск по username или имени..."
                className="w-full rounded-[22px] border px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.98)',
                  borderColor: 'var(--border)',
                }}
              />
            </form>
          </div>

          {profiles?.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {profiles.map((profile) => (
                <Link
                  key={profile.id}
                  href={`/u/${profile.username}`}
                  className="orange-button orange-glass-soft rounded-[28px] p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="orange-3d flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-white">AVA</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-lg font-bold">
                        {profile.display_name || profile.username || 'Пользователь'}
                      </div>

                      <div className="mt-1 truncate text-sm" style={{ color: 'var(--text-muted)' }}>
                        {profile.username ? `@${profile.username}` : 'Без username'}
                      </div>

                      <div
                        className="mt-3 line-clamp-3 text-sm leading-7"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {profile.bio || 'Пользователь пока ничего не написал о себе.'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="orange-glass-soft rounded-[28px] p-6" style={{ color: 'var(--text-muted)' }}>
              Ничего не найдено.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}