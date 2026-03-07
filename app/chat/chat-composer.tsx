'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function transliterateRu(text: string) {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e',
    ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
    н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
    ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
    ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  }

  return text
    .split('')
    .map((char) => {
      const lower = char.toLowerCase()
      const converted = map[lower]
      if (converted === undefined) return char
      return char === lower
        ? converted
        : converted.charAt(0).toUpperCase() + converted.slice(1)
    })
    .join('')
}

function sanitizeFileName(fileName: string) {
  const parts = fileName.split('.')
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : ''
  const base = parts.join('.')

  const transliterated = transliterateRu(base)

  const safeBase = transliterated
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()

  const fallback = safeBase || 'file'

  return ext ? `${fallback}.${ext}` : fallback
}

export function ChatComposer({ dialogId }: { dialogId: string }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(`dialog-room-${dialogId}`).subscribe()
    channelRef.current = channel

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      supabase.removeChannel(channel)
    }
  }, [dialogId])

  async function broadcastTyping(isTyping: boolean) {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !channelRef.current) return

    await channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        dialogId,
        userId: user.id,
        isTyping,
      },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const body = text.trim()
    if (!body) return

    setSending(true)

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Unauthorized')

      const { error } = await supabase.from('messages').insert({
        dialog_id: dialogId,
        sender_id: user.id,
        body,
      })

      if (error) throw error

      setText('')
      await broadcastTyping(false)
    } finally {
      setSending(false)
    }
  }

  async function handleFileUpload(file: File) {
    setUploading(true)

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Unauthorized')

      const safeName = sanitizeFileName(file.name)
      const filePath = `${dialogId}/${user.id}/${Date.now()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const messageBody = file.type.startsWith('image/') ? 'Изображение' : 'Файл'

      const { data: insertedMessage, error: messageError } = await supabase
        .from('messages')
        .insert({
          dialog_id: dialogId,
          sender_id: user.id,
          body: messageBody,
        })
        .select('id')
        .single()

      if (messageError) throw messageError

      const { error: attachmentError } = await supabase
        .from('message_attachments')
        .insert({
          message_id: insertedMessage.id,
          storage_path: filePath,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        })

      if (attachmentError) throw attachmentError
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="pt-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={text}
            onChange={async (e) => {
              const value = e.target.value
              setText(value)

              await broadcastTyping(true)

              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
              }

              typingTimeoutRef.current = setTimeout(async () => {
                await broadcastTyping(false)
              }, 1200)
            }}
            placeholder="Напиши сообщение..."
            className="w-full rounded-2xl border px-4 py-3"
            style={{
              background: 'rgba(255,255,255,0.76)',
              borderColor: 'var(--border)',
            }}
          />

          <button
            type="submit"
            disabled={sending}
            className="rounded-2xl px-5 py-3 font-medium"
            style={{
              background: 'linear-gradient(135deg, #5b9cff 0%, #79b2ff 100%)',
              color: 'var(--primary-text)',
            }}
          >
            {sending ? '...' : 'Отправить'}
          </button>
        </div>
      </form>

      <div className="mt-3 flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) {
              await handleFileUpload(file)
              e.target.value = ''
            }
          }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-2xl px-4 py-3 font-medium"
          style={{
            background: 'rgba(255,255,255,0.72)',
            border: '1px solid var(--border)',
          }}
        >
          {uploading ? 'Загрузка...' : 'Файл / картинка'}
        </button>

        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Можно отправить изображение или файл
        </div>
      </div>
    </div>
  )
}