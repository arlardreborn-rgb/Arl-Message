'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function MarkDialogRead({ dialogId }: { dialogId: string }) {
  useEffect(() => {
    if (!dialogId) return

    const run = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      await supabase.from('dialog_reads').upsert({
        dialog_id: dialogId,
        user_id: user.id,
        last_read_at: new Date().toISOString(),
      })
    }

    run()
  }, [dialogId])

  return null
}