'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AvatarCropModal } from './avatar-crop-modal'
import { useRouter } from 'next/navigation'

function sanitizeFileName(fileName: string) {
  const parts = fileName.split('.')
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : 'jpg'
  const base = parts.join('.')

  const safeBase = base
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()

  return `${safeBase || 'avatar'}.${ext}`
}

export function AvatarUpload({ avatarUrl }: { avatarUrl: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(avatarUrl)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [originalName, setOriginalName] = useState('avatar.jpg')
  const router = useRouter()

  async function uploadBlob(blob: Blob) {
    setLoading(true)

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Unauthorized')

      const safeName = sanitizeFileName(originalName)
      const filePath = `${user.id}/${Date.now()}-${safeName}`

      const file = new File([blob], safeName, { type: 'image/jpeg' })

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      setPreview(publicUrl)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-5">
        <div
          className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border"
          style={{ background: 'var(--panel)', borderColor: 'var(--border)' }}
        >
          {preview ? (
            <img src={preview} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Аватар
            </span>
          )}
        </div>

        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return

              setOriginalName(file.name)
              const localUrl = URL.createObjectURL(file)
              setCropSrc(localUrl)
              e.target.value = ''
            }}
          />

          <button
            type="button"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
            className="rounded-2xl px-5 py-3 font-medium"
            style={{ background: 'var(--panel-2)', color: 'var(--text)' }}
          >
            {loading ? 'Загрузка...' : 'Загрузить аватар'}
          </button>
        </div>
      </div>

      {cropSrc ? (
        <AvatarCropModal
          imageSrc={cropSrc}
          onClose={() => setCropSrc(null)}
          onConfirm={uploadBlob}
        />
      ) : null}
    </>
  )
}