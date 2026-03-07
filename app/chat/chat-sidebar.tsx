'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type SidebarItem = {
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

export function ChatSidebar({
  initialItems,
  activeDialogId,
  currentUserId,
}: {
  initialItems: SidebarItem[]
  activeDialogId?: string
  currentUserId: string
}) {
  const [items, setItems] = useState<SidebarItem[]>(initialItems)

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  useEffect(() => {
    const supabase = createClient()

    const messagesChannel = supabase
      .channel('sidebar-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const inserted = payload.new as any

          setItems((prev) => {
            if (!prev.some((item) => item.id === inserted.dialog_id)) return prev

            const updated = prev.map((item) => {
              if (item.id !== inserted.dialog_id) return item

              const shouldIncreaseUnread =
                inserted.sender_id !== currentUserId && inserted.dialog_id !== activeDialogId

              return {
                ...item,
                lastMessage: {
                  body: inserted.body,
                  sender_id: inserted.sender_id,
                  created_at: inserted.created_at,
                },
                unreadCount: shouldIncreaseUnread
                  ? (item.unreadCount || 0) + 1
                  : item.unreadCount,
              }
            })

            updated.sort((a, b) => {
              const aTime = a.lastMessage?.created_at
                ? new Date(a.lastMessage.created_at).getTime()
                : 0
              const bTime = b.lastMessage?.created_at
                ? new Date(b.lastMessage.created_at).getTime()
                : 0
              return bTime - aTime
            })

            return updated
          })
        }
      )
      .subscribe()

    const readsChannel = supabase
      .channel('sidebar-dialog-reads')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dialog_reads',
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          const row = payload.new as any

          setItems((prev) =>
            prev.map((item) =>
              item.id === row?.dialog_id
                ? {
                    ...item,
                    unreadCount: 0,
                  }
                : item
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(readsChannel)
    }
  }, [activeDialogId, currentUserId])

  return (
    <div className="space-y-2.5">
      {items.length ? (
        items.map((item) => {
          const partnerName =
  item.partner?.display_name || item.partner?.username || 'Пользователь'

const partnerMeta = item.partner?.username
  ? `@${item.partner.username}`
  : item.partner?.display_name
  ? 'Без username'
  : 'Профиль не найден'

const preview = item.lastMessage?.body || 'Нет сообщений'

          return (
            <Link
              key={item.id}
              href={`/chat?dialog=${item.id}`}
              className="block rounded-[22px] p-3"
              style={{
                background:
                  item.id === activeDialogId
                    ? 'rgba(91, 156, 255, 0.16)'
                    : 'rgba(255,255,255,0.58)',
                border: '1px solid var(--border)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border"
                  style={{
                    background: 'rgba(255,255,255,0.74)',
                    borderColor: 'var(--border)',
                  }}
                >
                  {item.partner?.avatar_url ? (
                    <img
                      src={item.partner.avatar_url}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      avatar
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{partnerName}</div>
                  <div
  className="truncate text-xs"
  style={{ color: 'var(--text-muted)' }}
>
  {partnerMeta}
</div>
<div
  className="truncate text-sm"
  style={{ color: 'var(--text-muted)' }}
>
  {preview}
</div>
                </div>

                {item.unreadCount > 0 ? (
                  <div
                    className="flex min-w-[24px] items-center justify-center rounded-full px-2 py-1 text-xs font-bold"
                    style={{
                      background: '#FF7F49',
                      color: '#fff',
                    }}
                  >
                    {item.unreadCount}
                  </div>
                ) : null}
              </div>
            </Link>
          )
        })
      ) : (
        <div style={{ color: 'var(--text-muted)' }}>
          Пока нет чатов. Зайди в раздел «Люди» и начни диалог.
        </div>
      )}
    </div>
  )
}