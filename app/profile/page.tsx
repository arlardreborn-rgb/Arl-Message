import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'

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
    .maybeSingle()

  async function updateProfile(formData: FormData) {
    'use server'

    const username = String(formData.get('username') || '')
      .trim()
      .toLowerCase()
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
    <main className="relative min-h-[calc(100vh-90px)] overflow-hidden px-4 py-6 md:px-8 md:py-10">
      <div className="orange-blob orange-float-1 left-[4%] top-[12%] h-20 w-20 md:h-28 md:w-28" />
      <div className="orange-blob orange-float-2 right-[6%] top-[10%] h-16 w-16 md:h-24 md:w-24" />

      <div className="mx-auto max-w-5xl">
        <div className="orange-glass rounded-[36px] p-5 md:p-8">
          <div className="mb-6">
            <div className="orange-pill mb-4 px-4 py-2 text-sm font-medium">
              <span>●</span>
              <span>Настройки профиля</span>
            </div>

            <h1 className="text-4xl font-bold md:text-5xl">Мой профиль</h1>
            <p className="mt-3 max-w-2xl leading-8" style={{ color: 'var(--text-muted)' }}>
              Настрой своё имя, username и описание. Чем аккуратнее заполнен профиль, тем лучше он
              выглядит в поиске, чатах и публичной странице.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="orange-glass-soft rounded-[30px] p-5">
              <div className="mb-5 text-lg font-bold">Визитка</div>

              <div className="flex flex-col items-center text-center">
                <div className="orange-3d flex h-28 w-28 items-center justify-center overflow-hidden rounded-full">
                  {profile?.avatar_url ? (
                   <Image
  src={profile.avatar_url}
  alt="avatar"
  width={112}
  height={112}
  className="h-full w-full object-cover"
  sizes="112px"
/>
                  ) : (
                    <span className="text-sm font-semibold text-white">AVA</span>
                  )}
                </div>

                <div className="mt-4 text-xl font-bold">
                  {profile?.display_name || profile?.username || 'Пользователь'}
                </div>

                <div className="mt-1" style={{ color: 'var(--text-muted)' }}>
                  {profile?.username ? `@${profile.username}` : 'Без username'}
                </div>

                <div
                  className="mt-4 w-full rounded-[24px] p-4 text-left"
                  style={{ background: 'rgba(255,255,255,0.96)', border: '1px solid var(--border)' }}
                >
                  <div className="mb-2 text-sm font-semibold">Описание</div>
                  <div className="text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
                    {profile?.bio || 'Пока ничего не добавлено.'}
                  </div>
                </div>
              </div>
            </aside>

            <section className="orange-glass-soft rounded-[30px] p-5 md:p-6">
              <form action={updateProfile} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold">Email</label>
                  <input
                    value={profile?.email || ''}
                    disabled
                    className="w-full rounded-[20px] border px-4 py-3 opacity-80"
                    style={{
                      background: 'rgba(255,255,255,0.98)',
                      borderColor: 'var(--border)',
                    }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">Username</label>
                  <input
                    name="username"
                    defaultValue={profile?.username || ''}
                    required
                    className="w-full rounded-[20px] border px-4 py-3"
                    style={{
                      background: 'rgba(255,255,255,0.98)',
                      borderColor: 'var(--border)',
                    }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">Имя</label>
                  <input
                    name="display_name"
                    defaultValue={profile?.display_name || ''}
                    required
                    className="w-full rounded-[20px] border px-4 py-3"
                    style={{
                      background: 'rgba(255,255,255,0.98)',
                      borderColor: 'var(--border)',
                    }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">Описание</label>
                  <textarea
                    name="bio"
                    defaultValue={profile?.bio || ''}
                    className="min-h-[160px] w-full rounded-[20px] border px-4 py-3"
                    style={{
                      background: 'rgba(255,255,255,0.98)',
                      borderColor: 'var(--border)',
                    }}
                  />
                </div>

                <button
                  className="orange-button orange-primary rounded-[22px] px-6 py-3 font-semibold"
                >
                  Сохранить профиль
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}