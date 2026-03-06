import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { RealtimeMessages } from '@/components/chat/realtime-messages'
import { logout } from './logout'
import { ChatFileUpload } from '@/components/chat/chat-file-upload'
import { ChatMessages } from '@/components/chat/chat-messages'
import Link from 'next/link'

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ dialog?: string }>
}) {
  const { dialog } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .eq('id', user.id)
    .single()

  const { data: memberships } = await supabase
    .from('dialog_members')
    .select('dialog_id')
    .eq('user_id', user.id)

  const dialogIds = memberships?.map((m) => m.dialog_id) ?? []

  const { data: dialogs } =
    dialogIds.length > 0
      ? await supabase
          .from('dialogs')
          .select('*')
          .in('id', dialogIds)
          .order('created_at', { ascending: false })
      : { data: [] as any[] }

  const activeDialogId =
    dialog && dialogIds.includes(dialog) ? dialog : dialogs?.[0]?.id

  const { data: messages } = activeDialogId
    ? await supabase
        .from('messages')
        .select(`
          *,
          message_attachments (
            id,
            storage_path,
            file_name,
            mime_type,
            size_bytes
          )
        `)
        .eq('dialog_id', activeDialogId)
        .order('created_at', { ascending: true })
    : { data: [] as any[] }

  async function sendMessage(formData: FormData) {
    'use server'

    const dialogId = String(formData.get('dialogId') || '')
    const body = String(formData.get('body') || '').trim()
    const file = formData.get('file') as File | null

    if (!dialogId) return

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const hasText = !!body
    const hasFile = !!file && file.size > 0

    if (!hasText && !hasFile) return

    const messageBody = hasText
      ? body
      : file?.type?.startsWith('image/')
      ? 'Изображение'
      : 'Файл'

    const { data: insertedMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        dialog_id: dialogId,
        sender_id: user.id,
        body: messageBody,
      })
      .select('id')
      .single()

    if (messageError) {
      throw new Error(messageError.message)
    }

    if (hasFile && file) {
      const safeName = file.name.replaceAll(' ', '_')
      const filePath = `${dialogId}/${user.id}/${Date.now()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file)

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const { error: attachError } = await supabase
        .from('message_attachments')
        .insert({
          message_id: insertedMessage.id,
          storage_path: filePath,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        })

      if (attachError) {
        throw new Error(attachError.message)
      }
    }

    revalidatePath('/chat')
    revalidatePath(`/chat?dialog=${dialogId}`)
  }

  return (
    <main className="min-h-screen p-4 md:p-6" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto flex max-w-7xl flex-col gap-4">

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
          <aside
            className="rounded-[28px] border p-4"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-2xl font-semibold">Чаты</div>
              <Link href="/people" className="text-sm underline">
                Найти человека
              </Link>
            </div>

            <div className="space-y-3">
              {dialogs?.length ? (
                dialogs.map((d) => (
                  <Link
                    key={d.id}
                    href={`/chat?dialog=${d.id}`}
                    className="block rounded-[22px] border p-4"
                    style={{
                      background: d.id === activeDialogId ? 'var(--panel-2)' : 'var(--panel)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div className="font-medium">{d.title || 'Личный чат'}</div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Защищённая переписка
                    </div>
                  </Link>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>
                  Пока нет чатов. Зайди в раздел «Люди» и начни диалог.
                </div>
              )}
            </div>
          </aside>

          <section
            className="rounded-[28px] border p-4"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
          >
            <div className="mb-4 text-2xl font-semibold">Сообщения</div>

            {activeDialogId ? <RealtimeMessages dialogId={activeDialogId} /> : null}

           {activeDialogId ? (
  <ChatMessages
    initialMessages={messages || []}
    activeDialogId={activeDialogId}
    currentUserId={user.id}
  />
) : (
  <div style={{ color: 'var(--text-muted)' }}>
    Выбери чат слева или найди человека через раздел «Люди»
  </div>
)}

            <form action={sendMessage} className="flex flex-col gap-3">
              <input type="hidden" name="dialogId" value={activeDialogId || ''} />

              <div className="flex gap-3">
                <input
                  name="body"
                  placeholder="Напиши сообщение..."
                  className="w-full rounded-2xl border px-4 py-3"
                  disabled={!activeDialogId}
                />
                <button
                  type="submit"
                  className="rounded-2xl px-5 py-3 font-medium"
                  style={{ background: 'var(--primary)', color: 'var(--primary-text)' }}
                  disabled={!activeDialogId}
                >
                  Отправить
                </button>
              </div>
            </form>

            {activeDialogId ? <ChatFileUpload dialogId={activeDialogId} /> : null}
          </section>
        </div>
      </div>
    </main>
  )
}