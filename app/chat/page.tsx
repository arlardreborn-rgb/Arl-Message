import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatSidebar } from './chat-sidebar'
import { ChatHeader } from './chat-header'
import { ChatMessages } from './chat-messages'
import { ChatComposer } from './chat-composer'
import { MarkDialogRead } from './mark-dialog-read'

type DialogItem = {
  id: string
  partner: {
    id: string
    username: string | null
    display_name: string | null
    avatar_url: string | null
  } | null
  lastMessage: {
    body: string
    sender_id: string
    created_at: string
  } | null
  unreadCount: number
}

type PartnerRow = {
  dialog_id: string
  partner_id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
}

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

  const { data: memberships } = await supabase
    .from('dialog_members')
    .select('dialog_id')
    .eq('user_id', user.id)

  const dialogIds = memberships?.map((m) => m.dialog_id) ?? []

  const { data: dialogs } =
    dialogIds.length > 0
      ? await supabase
          .from('dialogs')
          .select('id, created_at, type')
          .in('id', dialogIds)
          .order('created_at', { ascending: false })
      : { data: [] as any[] }

  const { data: rawPartnersData } = dialogIds.length
    ? await supabase.rpc('get_my_dialog_partners', {
        dialog_ids_input: dialogIds,
      })
    : { data: [] as any[] }

  const partnersData = (rawPartnersData ?? []) as PartnerRow[]

  const partnerMap = new Map<string, DialogItem['partner']>(
    partnersData.map((row) => [
      row.dialog_id,
      {
        id: row.partner_id,
        username: row.username,
        display_name: row.display_name,
        avatar_url: row.avatar_url,
      },
    ])
  )

  const dialogItems: DialogItem[] = await Promise.all(
    ((dialogs as { id: string; created_at: string; type: string }[]) || []).map(
      async (dialogRow) => {
        const partner = partnerMap.get(dialogRow.id) || null

        const { data: lastMessage } = await supabase
          .from('messages')
          .select('body, sender_id, created_at')
          .eq('dialog_id', dialogRow.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        const { data: readRow } = await supabase
          .from('dialog_reads')
          .select('last_read_at')
          .eq('dialog_id', dialogRow.id)
          .eq('user_id', user.id)
          .maybeSingle()

        const readAfter = readRow?.last_read_at || '1970-01-01T00:00:00Z'

        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('dialog_id', dialogRow.id)
          .neq('sender_id', user.id)
          .gt('created_at', readAfter)

        return {
          id: dialogRow.id,
          partner,
          lastMessage: lastMessage || null,
          unreadCount: unreadCount || 0,
        }
      }
    )
  )

  dialogItems.sort((a, b) => {
    const aTime = a.lastMessage?.created_at
      ? new Date(a.lastMessage.created_at).getTime()
      : 0
    const bTime = b.lastMessage?.created_at
      ? new Date(b.lastMessage.created_at).getTime()
      : 0
    return bTime - aTime
  })

  const activeDialogId =
    dialog && dialogIds.some((id) => String(id) === String(dialog))
      ? String(dialog)
      : undefined

  const activeDialogItem = activeDialogId
    ? dialogItems.find((item) => item.id === activeDialogId) || null
    : null

  const chatPartner = activeDialogItem?.partner || null

  const { data: messages } = activeDialogId
    ? await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          body,
          created_at,
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

  let otherUserLastReadAt: string | null = null

  if (activeDialogId && chatPartner) {
    const { data: readRow } = await supabase
      .from('dialog_reads')
      .select('last_read_at')
      .eq('dialog_id', activeDialogId)
      .eq('user_id', chatPartner.id)
      .maybeSingle()

    otherUserLastReadAt = readRow?.last_read_at || null
  }

  return (
    <main className="relative h-[calc(100svh-90px)] overflow-hidden px-3 py-3 md:px-6 md:py-6">
      <div className="mx-auto h-full max-w-7xl">
        <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-[350px_1fr]">
          <aside
            className={`${
              activeDialogId ? 'hidden md:block' : 'block'
            } orange-glass top-shine h-full min-h-0 rounded-[30px] p-4`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-2xl font-bold">Чаты</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Личные переписки
                </div>
              </div>

              <Link
                href="/people"
                className="orange-button orange-secondary shrink-0 rounded-2xl px-4 py-2 text-sm font-medium"
              >
                Найти человека
              </Link>
            </div>

            <div className="h-[calc(100%-72px)] overflow-y-auto pr-1">
              <ChatSidebar
                initialItems={dialogItems}
                activeDialogId={activeDialogId}
                currentUserId={user.id}
              />
            </div>
          </aside>

          <section
            className={`${
              activeDialogId ? 'flex' : 'hidden md:flex'
            } orange-glass top-shine h-full min-h-0 flex-col rounded-[30px] p-3 md:p-4`}
          >
            <ChatHeader
              partner={chatPartner}
              activeDialogId={activeDialogId}
              currentUserId={user.id}
              showBack={!!activeDialogId}
            />

            {activeDialogId ? <MarkDialogRead dialogId={activeDialogId} /> : null}

            <div className="min-h-0 flex-1">
              {activeDialogId ? (
                <ChatMessages
                  initialMessages={messages || []}
                  activeDialogId={activeDialogId}
                  currentUserId={user.id}
                  partnerId={chatPartner?.id || null}
                  initialOtherUserLastReadAt={otherUserLastReadAt}
                />
              ) : (
                <div className="orange-glass-soft flex h-full min-h-[420px] flex-col items-center justify-center rounded-[28px] p-8 text-center">
                  <div className="mb-3 text-2xl font-bold">Выбери диалог</div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    Открой существующий чат слева или найди нового собеседника в разделе «Люди».
                  </div>
                </div>
              )}
            </div>

            {activeDialogId ? (
              <div className="mt-3 shrink-0">
                <ChatComposer dialogId={activeDialogId} />
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  )
}