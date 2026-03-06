'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
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

export function ChatFileUpload({ dialogId }: { dialogId: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleUpload(file: File) {
    setLoading(true)

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Unauthorized')
      }

      const safeName = sanitizeFileName(file.name)
      const filePath = `${dialogId}/${user.id}/${Date.now()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

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

      if (messageError) {
        throw messageError
      }

      const { error: attachmentError } = await supabase
        .from('message_attachments')
        .insert({
          message_id: insertedMessage.id,
          storage_path: filePath,
          file_name: file.name, // показываем пользователю оригинальное имя
          mime_type: file.type,
          size_bytes: file.size,
        })

      if (attachmentError) {
        throw attachmentError
      }

      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (file) {
            await handleUpload(file)
            e.target.value = ''
          }
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="rounded-2xl px-4 py-3 font-medium"
        style={{ background: 'var(--panel-2)', color: 'var(--text)' }}
      >
        {loading ? 'Загрузка...' : 'Файл / картинка'}
      </button>

      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Можно загружать файлы с кириллицей в названии
      </div>
    </div>
  )
}