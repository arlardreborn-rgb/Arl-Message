import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Link } from 'lucide-react'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url')
    .eq('username', username.toLowerCase())
    .single()

  if (!profile) notFound()

  const isMe = profile.id === user.id

  async function startDirectChat(formData: FormData) {
    'use server'

    const otherUserId = String(formData.get('otherUserId') || '')

    if (!otherUserId) {
      throw new Error('Не передан user id')
    }

    const supabase = await createClient()

    const { data, error } = await supabase.rpc('find_or_create_direct_dialog', {
      other_user_id: otherUserId,
    })

    if (error) {
      throw new Error(error.message)
    }

    redirect(`/chat?dialog=${data}`)
  }

  return (
    <main className="min-h-screen p-6" style={{ background: 'var(--bg)' }}>
      <div
        className="mx-auto max-w-3xl rounded-[32px] border p-8"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div
            className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border"
            style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Аватар</span>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              {profile.display_name || profile.username}
            </h1>

            <div className="mt-2 text-lg" style={{ color: 'var(--text-muted)' }}>
              @{profile.username}
            </div>

            <p className="mt-4 whitespace-pre-wrap leading-7">
              {profile.bio || 'Пользователь пока ничего о себе не написал.'}
            </p>

            <div className="mt-6">
              {isMe ? (
                <Link
                  href="/profile"
                  className="inline-flex rounded-2xl px-5 py-3 font-medium"
                  style={{ background: 'var(--panel-2)', color: 'var(--text)' }}
                >
                  Редактировать профиль
                </Link>
              ) : (
                <form action={startDirectChat}>
                  <input type="hidden" name="otherUserId" value={profile.id} />
                  <button
                    className="rounded-2xl px-5 py-3 font-medium"
                    style={{ background: 'var(--primary)', color: 'var(--primary-text)' }}
                  >
                    Начать чат
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}