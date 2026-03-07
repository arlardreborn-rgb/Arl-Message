import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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

  const { data: allMembers, error: allMembersError } = dialogIds.length
  ? await supabase
      .from('dialog_members')
      .select('dialog_id, user_id')
      .in('dialog_id', dialogIds)
  : { data: [], error: null }

if (allMembersError) {
  console.log('ALL MEMBERS ERROR:', allMembersError)
}

const membersByDialog = new Map<string, { dialog_id: string; user_id: string }[]>()

for (const row of allMembers || []) {
  const current = membersByDialog.get(row.dialog_id) || []
  current.push(row)
  membersByDialog.set(row.dialog_id, current)
}

const otherUserIds = Array.from(
  new Set(
    (dialogs || [])
      .map((dialogRow) => {
        const members = membersByDialog.get(dialogRow.id) || []
        const otherMember = members.find((m) => m.user_id !== user.id)
        return otherMember?.user_id || null
      })
      .filter(Boolean)
  )
) as string[]

const { data: partnerProfiles, error: partnerProfilesError } = otherUserIds.length
  ? await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', otherUserIds)
  : { data: [], error: null }

if (partnerProfilesError) {
  console.log('PARTNER PROFILES ERROR:', partnerProfilesError)
}

const profileMap = new Map(
  (partnerProfiles || []).map((profile) => [profile.id, profile])
)

const dialogItems: DialogItem[] = await Promise.all(
  (dialogs || []).map(async (dialogRow) => {
    const members = membersByDialog.get(dialogRow.id) || []
    const otherMember = members.find((m) => m.user_id !== user.id)
    const partner = otherMember ? profileMap.get(otherMember.user_id) || null : null

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
  })
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
    dialog && dialogIds.includes(dialog) ? dialog : undefined

  const activeDialogItem =
    activeDialogId ? dialogItems.find((item) => item.id === activeDialogId) || null : null

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
    <main className="min-h-screen px-3 py-3 md:px-6 md:py-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[330px_1fr]">
          <aside
            className={`${activeDialogId ? 'hidden md:block' : 'block'} rounded-[28px] border p-4`}
            style={{
              background: 'rgba(255,255,255,0.62)',
              borderColor: 'var(--border)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-2xl font-semibold">Чаты</div>
              <Link href="/people" className="text-sm underline">
                Найти человека
              </Link>
            </div>

            <ChatSidebar
              initialItems={dialogItems}
              activeDialogId={activeDialogId}
              currentUserId={user.id}
            />
          </aside>

          <section
            className={`${activeDialogId ? 'flex' : 'hidden md:flex'} min-h-[calc(100vh-110px)] flex-col rounded-[28px] border p-3 md:min-h-[calc(100vh-140px)] md:p-4`}
            style={{
              background: 'rgba(255,255,255,0.62)',
              borderColor: 'var(--border)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <ChatHeader
              partner={chatPartner}
              activeDialogId={activeDialogId}
              currentUserId={user.id}
              showBack={!!activeDialogId}
            />

            {activeDialogId ? <MarkDialogRead dialogId={activeDialogId} /> : null}

            <div className="flex-1 overflow-y-auto">
              {activeDialogId ? (
                <ChatMessages
                  initialMessages={messages || []}
                  activeDialogId={activeDialogId}
                  currentUserId={user.id}
                  partnerId={chatPartner?.id || null}
                  initialOtherUserLastReadAt={otherUserLastReadAt}
                />
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>
                  Выбери чат слева или найди человека через раздел «Люди»
                </div>
              )}
            </div>

            {activeDialogId ? (
              <div className="mt-auto pt-2">
                <ChatComposer dialogId={activeDialogId} />
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  )
}