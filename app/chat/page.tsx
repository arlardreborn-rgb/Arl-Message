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
    last_seen_at: string | null
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
  last_seen_at: string | null
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
        last_seen_at: row.last_seen_at,
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
    <main
      className={`relative overflow-hidden ${
        activeDialogId
          ? 'h-[100svh] px-0 py-0 md:h-[calc(100svh-88px)] md:px-3 md:py-3'
          : 'h-[calc(100svh-88px)] px-3 py-3 md:px-5 md:py-5'
      }`}
    >
      <div className={`${activeDialogId ? 'h-full max-w-none' : 'mx-auto h-full max-w-[1800px]'}`}>
        <div
          className={`grid h-full ${
            activeDialogId
              ? 'grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]'
              : 'grid-cols-1 md:grid-cols-[360px_minmax(0,1fr)]'
          } gap-0 md:gap-4`}
        >
          <aside
            className={`${
              activeDialogId ? 'hidden md:flex' : 'flex'
            } orange-glass top-shine h-full min-h-0 flex-col ${
              activeDialogId ? 'rounded-none md:rounded-[30px]' : 'rounded-[30px]'
            } p-4`}
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

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
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
            } orange-glass top-shine h-full min-h-0 flex-col ${
              activeDialogId ? 'rounded-none md:rounded-[30px]' : 'rounded-[30px]'
            } ${
              activeDialogId ? 'p-0 md:p-4' : 'p-4'
            }`}
          >
            <div className={`${activeDialogId ? 'px-3 pt-3 md:px-0 md:pt-0' : ''} shrink-0`}>
              <ChatHeader
                partner={chatPartner}
                activeDialogId={activeDialogId}
                currentUserId={user.id}
                showBack={!!activeDialogId}
              />
            </div>

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
              <div className="shrink-0 px-3 pb-3 pt-2 md:px-0 md:pb-0 md:pt-3">
                <ChatComposer dialogId={activeDialogId} />
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  )
}