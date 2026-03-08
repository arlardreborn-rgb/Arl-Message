'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPresenceLabel } from '@/lib/presence'
import Image from 'next/image'

type ChatPartner = {
  last_seen_at: string | null
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
      <div className="orange-glass-soft mb-4 rounded-[26px] px-4 py-4">
        <div className="text-lg font-bold">Чат</div>
        <div style={{ color: 'var(--text-muted)' }}>Выбери диалог слева</div>
      </div>
    )
  }

  return (
    <div className="orange-glass-soft top-shine mb-4 rounded-[26px] px-4 py-4">
      <div className="flex items-center gap-3">
        {showBack ? (
          <Link
            href="/chat"
            className="orange-button orange-secondary inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full md:hidden"
          >
            ←
          </Link>
        ) : null}

        <div
          className="orange-3d flex h-14 w-14 items-center justify-center overflow-hidden rounded-full"
        >
          {partner.avatar_url ? (
            
<Image
  src={partner.avatar_url}
  alt="avatar"
  width={56}
  height={56}
  className="h-full w-full object-cover"
  sizes="56px"
/>
          ) : (
            <span className="text-sm font-semibold text-white">AVA</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-xl font-bold">
            {partner.display_name || partner.username || 'Пользователь'}
          </div>

          <div className="truncate text-sm" style={{ color: 'var(--text-muted)' }}>
  {typingText || getPresenceLabel(partner.last_seen_at)}
</div>
        </div>

        {partner.username ? (
          <Link
            href={`/u/${partner.username}`}
            className="orange-button orange-secondary hidden rounded-2xl px-4 py-2 text-sm font-medium sm:inline-flex"
          >
            Профиль
          </Link>
        ) : null}
      </div>
    </div>
  )
}