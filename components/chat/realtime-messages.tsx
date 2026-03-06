'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function RealtimeMessages({ dialogId }: { dialogId: string }) {
  const router = useRouter()

  useEffect(() => {
    if (!dialogId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`messages-${dialogId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `dialog_id=eq.${dialogId}`,
        },
        () => {
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dialogId, router])

  return null
}