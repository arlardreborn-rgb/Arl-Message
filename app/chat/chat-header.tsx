'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type ChatPartner = {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
}

export function ChatHeader({
  partner,
  activeDialogId,
  currentUserId,
  showBack = false,
}: {
  partner: ChatPartner | null
  activeDialogId?: string
  currentUserId: string
  showBack?: boolean
}) {
  const [typingText, setTypingText] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!activeDialogId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`dialog-room-${activeDialogId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const incomingUserId = payload.payload?.userId
        const isTyping = payload.payload?.isTyping

        if (!incomingUserId || incomingUserId === currentUserId) return

        if (isTyping) {
          setTypingText('печатает...')

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }

          timeoutRef.current = setTimeout(() => {
            setTypingText('')
          }, 1800)
        } else {
          setTypingText('')
        }
      })
      .subscribe()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      supabase.removeChannel(channel)
    }
  }, [activeDialogId, currentUserId])

  if (!partner) {
    return (
      <div
        className="mb-4 rounded-[24px] border px-4 py-3"
        style={{
          background: 'rgba(255,255,255,0.62)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="text-lg font-semibold">Чат</div>
        <div style={{ color: 'var(--text-muted)' }}>Выбери диалог слева</div>
      </div>
    )
  }

  return (
    <div
      className="mb-4 rounded-[24px] border px-4 py-3"
      style={{
        background: 'rgba(255,255,255,0.62)',
        borderColor: 'var(--border)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex items-center gap-3">
        {showBack ? (
          <Link
            href="/chat"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full md:hidden"
            style={{
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid var(--border)',
            }}
          >
            ←
          </Link>
        ) : null}

        <div
          className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border"
          style={{
            background: 'rgba(255,255,255,0.72)',
            borderColor: 'var(--border)',
          }}
        >
          {partner.avatar_url ? (
            <img
              src={partner.avatar_url}
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
          <div className="truncate text-lg font-semibold">
            {partner.display_name || partner.username || 'Пользователь'}
          </div>

          <div className="truncate text-sm" style={{ color: 'var(--text-muted)' }}>
            {typingText || (partner.username ? `@${partner.username}` : 'Без username')}
          </div>
        </div>

        {partner.username ? (
          <Link
            href={`/u/${partner.username}`}
            className="hidden rounded-2xl px-4 py-2 text-sm font-medium sm:inline-flex"
            style={{
              background: 'rgba(255,255,255,0.74)',
              border: '1px solid var(--border)',
            }}
          >
            Профиль
          </Link>
        ) : null}
      </div>
    </div>
  )
}