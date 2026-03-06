'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function FileUpload({ dialogId }: { dialogId: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleFile(file: File) {
    setLoading(true)

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Unauthorized')

      const filePath = `${dialogId}/${user.id}/${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          dialog_id: dialogId,
          sender_id: user.id,
          body: file.type.startsWith('image/') ? 'Изображение' : 'Файл',
        })
        .select('id')
        .single()

      if (messageError) throw messageError

      const { error: attachmentError } = await supabase
        .from('message_attachments')
        .insert({
          message_id: messageData.id,
          storage_path: filePath,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        })

      if (attachmentError) throw attachmentError

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
          if (file) await handleFile(file)
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="rounded-2xl px-4 py-3"
        style={{ background: 'var(--panel-2)', color: 'var(--text)' }}
      >
        {loading ? 'Загрузка...' : 'Файл / картинка'}
      </button>
    </div>
  )
}