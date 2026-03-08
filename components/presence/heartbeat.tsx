'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function PresenceHeartbeat() {
  useEffect(() => {
    let mounted = true

    const supabase = createClient()

    const updateLastSeen = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!mounted || !user) return

      await supabase
        .from('profiles')
        .update({
          last_seen_at: new Date().toISOString(),
        })
        .eq('id', user.id)
    }

    updateLastSeen()

    const interval = setInterval(updateLastSeen, 30000)

    const onFocus = () => updateLastSeen()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        updateLastSeen()
      }
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      mounted = false
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return null
}