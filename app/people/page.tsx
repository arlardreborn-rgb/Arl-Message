import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const supabase = await createClient()

  let users: any[] = []

  if (q.trim()) {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, bio')
      .ilike('username', `%${q.trim().toLowerCase()}%`)
      .limit(20)

    users = data || []
  }

  return (
    <main className="min-h-screen p-6" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">Поиск людей</h1>

        <form className="mb-6">
          <input
            name="q"
            defaultValue={q}
            placeholder="Введи username..."
            className="w-full rounded-2xl border px-4 py-3"
          />
        </form>

        <div className="space-y-4">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/u/${user.username}`}
              className="block rounded-[28px] border p-5"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border"
                  style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs">avatar</span>
                  )}
                </div>

                <div>
                  <div className="font-semibold">{user.display_name || user.username}</div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    @{user.username}
                  </div>
                  <div className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {user.bio || 'Без описания'}
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {!users.length && q.trim() ? (
            <div style={{ color: 'var(--text-muted)' }}>Никого не найдено</div>
          ) : null}
        </div>
      </div>
    </main>
  )
}