'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Attachment = {
  id: string
  storage_path: string
  file_name: string | null
  mime_type: string | null
  size_bytes: number | null
}

type Message = {
  id: string
  sender_id: string
  body: string
  created_at: string
  message_attachments?: Attachment[]
}

export function ChatMessages({
  initialMessages,
  activeDialogId,
  currentUserId,
  partnerId,
  initialOtherUserLastReadAt,
}: {
  initialMessages: Message[]
  activeDialogId: string
  currentUserId: string
  partnerId: string | null
  initialOtherUserLastReadAt: string | null
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [otherUserLastReadAt, setOtherUserLastReadAt] = useState<string | null>(
    initialOtherUserLastReadAt
  )

  useEffect(() => {
    const unique = Array.from(
      new Map(initialMessages.map((msg) => [msg.id, msg])).values()
    )
    setMessages(unique)
  }, [initialMessages])

  useEffect(() => {
    setOtherUserLastReadAt(initialOtherUserLastReadAt)
  }, [initialOtherUserLastReadAt])

  useEffect(() => {
    if (!activeDialogId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`messages-${activeDialogId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `dialog_id=eq.${activeDialogId}`,
        },
        async (payload) => {
          const inserted = payload.new as any

          const { data: attachments } = await supabase
            .from('message_attachments')
            .select('id, storage_path, file_name, mime_type, size_bytes')
            .eq('message_id', inserted.id)

          setMessages((prev) => {
            const alreadyExists = prev.some((msg) => msg.id === inserted.id)
            if (alreadyExists) return prev

            return [
              ...prev,
              {
                ...inserted,
                message_attachments: attachments || [],
              },
            ]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeDialogId])

  useEffect(() => {
    if (!partnerId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`dialog-reads-${activeDialogId}-${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dialog_reads',
          filter: `user_id=eq.${partnerId}`,
        },
        (payload) => {
          const row = payload.new as any
          if (row?.dialog_id === activeDialogId) {
            setOtherUserLastReadAt(row.last_read_at)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeDialogId, partnerId])

  const supabase = createClient()

  return (
    <div className="mb-6 space-y-2.5">
      {messages.length ? (
        messages.map((msg) => {
          const mine = msg.sender_id === currentUserId

          const isRead =
            mine &&
            otherUserLastReadAt &&
            new Date(otherUserLastReadAt).getTime() >=
              new Date(msg.created_at).getTime()

          return (
            <div key={msg.id}>
              <div
                className={`max-w-[84%] rounded-[20px] px-3.5 py-2.5 md:max-w-[70%] ${
                  mine ? 'ml-auto' : ''
                }`}
                style={{
                  background: mine
                    ? 'linear-gradient(135deg, #FF7F49 0%, #ff8349 100%)'
                    : 'rgba(255, 255, 255, 0.83)',
                  color: mine ? 'var(--primary-text)' : 'var(--text)',
                  border: '1px solid var(--border)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="text-[15px] leading-6">{msg.body}</div>

                {msg.message_attachments?.length ? (
                  <div className="mt-2.5 space-y-2">
                    {msg.message_attachments.map((att) => {
                      const isImage = String(att.mime_type || '').startsWith('image/')
                      const {
                        data: { publicUrl: fileUrl },
                      } = supabase.storage.from('chat-files').getPublicUrl(att.storage_path)

                      return (
                        <div key={att.id}>
                          {isImage ? (
                            <Link href={fileUrl} target="_blank">
                              <img
                                src={fileUrl}
                                alt={att.file_name || 'image'}
                                className="max-h-64 rounded-xl border"
                              />
                            </Link>
                          ) : (
                            <Link
                              href={fileUrl}
                              target="_blank"
                              className="block rounded-xl border px-3 py-2 text-sm underline"
                              style={{
                                borderColor: 'var(--border)',
                                background: 'rgba(255,255,255,0.22)',
                              }}
                            >
                              {att.file_name || 'Файл'}
                            </Link>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : null}

                {isRead ? (
                  <div
                    className="mt-1.5 text-right text-[11px]"
                    style={{
                      color: mine ? 'rgba(255,255,255,0.74)' : 'var(--text-muted)',
                    }}
                  >
                    Прочитано
                  </div>
                ) : null}
              </div>
            </div>
          )
        })
      ) : (
        <div style={{ color: 'var(--text-muted)' }}>Пока нет сообщений</div>
      )}
    </div>
  )
}