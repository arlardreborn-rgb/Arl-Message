'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
  message_attachments?: Attachment[]
}

export function ChatMessages({
  initialMessages,
  activeDialogId,
  currentUserId,
}: {
  initialMessages: Message[]
  activeDialogId: string
  currentUserId: string
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

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

  const supabase = createClient()

  return (
    <div className="mb-6 space-y-3">
      {messages.length ? (
        messages.map((msg) => (
          <div key={msg.id}>
            <div
              className={`max-w-[75%] rounded-[22px] px-4 py-3 ${
                msg.sender_id === currentUserId ? 'ml-auto' : ''
              }`}
              style={{
                background:
                  msg.sender_id === currentUserId ? 'var(--primary)' : 'var(--panel)',
                color:
                  msg.sender_id === currentUserId
                    ? 'var(--primary-text)'
                    : 'var(--text)',
              }}
            >
              <div>{msg.body}</div>

              {msg.message_attachments?.length ? (
                <div className="mt-3 space-y-2">
                  {msg.message_attachments.map((att) => {
                    const isImage = String(att.mime_type || '').startsWith('image/')
                    const {
                      data: { publicUrl: fileUrl },
                    } = supabase.storage.from('chat-files').getPublicUrl(att.storage_path)

                    return (
                      <div key={att.id}>
                        {isImage ? (
                          <a href={fileUrl} target="_blank">
                            <img
                              src={fileUrl}
                              alt={att.file_name || 'image'}
                              className="max-h-64 rounded-xl border"
                            />
                          </a>
                        ) : (
                          <a
                            href={fileUrl}
                            target="_blank"
                            className="block rounded-xl border px-3 py-2 text-sm underline"
                            style={{
                              borderColor: 'var(--border)',
                              background: 'rgba(255,255,255,0.28)',
                            }}
                          >
                            {att.file_name || 'Файл'}
                          </a>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>
          </div>
        ))
      ) : (
        <div style={{ color: 'var(--text-muted)' }}>Пока нет сообщений</div>
      )}
    </div>
  )
}