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
    <div className="space-y-3">
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
              className="orange-button block rounded-[24px] p-3.5"
              style={{
                background:
                  item.id === activeDialogId
                    ? 'linear-gradient(135deg, rgba(255,122,26,0.18) 0%, rgba(255,166,94,0.22) 100%)'
                    : 'rgba(255,255,255,0.56)',
                border: '1px solid var(--border)',
                boxShadow:
                  item.id === activeDialogId
                    ? '0 14px 30px rgba(255,122,26,0.14)'
                    : '0 10px 24px rgba(255,122,26,0.06)',
                backdropFilter: 'blur(14px)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="orange-3d flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-full"
                  style={{ width: 52, height: 52 }}
                >
                  {item.partner?.avatar_url ? (
                    <img
                      src={item.partner.avatar_url}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-white">AVA</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[16px] font-bold">{partnerName}</div>

                  <div className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                    {partnerMeta}
                  </div>

                  <div className="mt-0.5 truncate text-sm" style={{ color: 'var(--text-muted)' }}>
                    {preview}
                  </div>
                </div>

                {item.unreadCount > 0 ? (
                  <div
                    className="orange-3d flex min-w-[26px] items-center justify-center rounded-full px-2 py-1 text-xs font-bold text-white"
                  >
                    {item.unreadCount}
                  </div>
                ) : null}
              </div>
            </Link>
          )
        })
      ) : (
        <div
          className="orange-glass-soft rounded-[24px] p-5"
          style={{ color: 'var(--text-muted)' }}
        >
          Пока нет чатов. Зайди в раздел «Люди» и начни диалог.
        </div>
      )}
    </div>
  )
}