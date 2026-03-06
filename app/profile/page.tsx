import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { AvatarUpload } from './avatar-upload'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, username, display_name, bio, avatar_url')
    .eq('id', user.id)
    .single()

  async function updateProfile(formData: FormData) {
    'use server'

    const username = String(formData.get('username') || '').trim().toLowerCase()
    const display_name = String(formData.get('display_name') || '').trim()
    const bio = String(formData.get('bio') || '').trim()

    if (!username || !display_name) {
      throw new Error('Username и имя обязательны')
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
      .from('profiles')
      .update({
        username,
        display_name,
        bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/profile')
    revalidatePath(`/u/${username}`)
  }

  return (
    <main className="min-h-screen p-6" style={{ background: 'var(--bg)' }}>
      <div
        className="mx-auto max-w-3xl rounded-[32px] border p-6"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
      >
        <h1 className="mb-6 text-3xl font-bold">Мой профиль</h1>

        <div className="mb-8">
          <AvatarUpload avatarUrl={profile?.avatar_url || ''} />
        </div>

        <form action={updateProfile} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <input
              value={profile?.email || ''}
              disabled
              className="w-full rounded-2xl border px-4 py-3 opacity-70"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Username</label>
            <input
              name="username"
              defaultValue={profile?.username || ''}
              className="w-full rounded-2xl border px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Имя</label>
            <input
              name="display_name"
              defaultValue={profile?.display_name || ''}
              className="w-full rounded-2xl border px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Описание</label>
            <textarea
              name="bio"
              defaultValue={profile?.bio || ''}
              className="min-h-[140px] w-full rounded-2xl border px-4 py-3"
            />
          </div>

          <button
            className="rounded-2xl px-6 py-3 font-semibold"
            style={{ background: 'var(--primary)', color: 'var(--primary-text)' }}
          >
            Сохранить профиль
          </button>
        </form>
      </div>
    </main>
  )
}