"use client"

import { useEffect } from 'react'
import { getSession } from 'next-auth/react'

export default function SessionLogger() {
  useEffect(() => {
    let mounted = true
    (async () => {
      try {
        const session = await getSession()
        if (!mounted) return
        // `token.id` is attached server-side but won't be typed on client session. Log available info instead.
        console.log('session user email', session?.user?.email)
      } catch (e) {
        console.error('SessionLogger error', e)
      }
    })()
    return () => { mounted = false }
  }, [])

  return null
}
