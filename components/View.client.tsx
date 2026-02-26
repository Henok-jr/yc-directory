"use client"

import React, { useEffect, useState } from 'react'

export default function ViewClient({ id }: { id: string }) {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true

    const run = async () => {
      try {
        const viewedKey = `viewed:${id}`
        const alreadyViewed = typeof window !== 'undefined' && sessionStorage.getItem(viewedKey) === '1'

        // GET current views via API route
        const res = await fetch(`/api/views/${id}`)
        const data = await res.json()
        if (!mounted) return

        const currentViews = data.views ?? 0
        setViews(currentViews)

        // Increment views once per browser session and update UI
        if (!alreadyViewed) {
          // mark as viewed immediately to avoid double increment in React dev/StrictMode
          try {
            sessionStorage.setItem(viewedKey, '1')
          } catch {}

          // optimistic update
          setViews((v) => (typeof v === 'number' ? v + 1 : 1))

          try {
            const incRes = await fetch(`/api/views/${id}`, { method: 'POST' })
            const incData = await incRes.json()
            if (!mounted) return
            if (typeof incData?.views === 'number') {
              setViews(incData.views)
            }
          } catch (e) {
            console.error('View increment error:', e)
          }
        }
      } catch (err) {
        console.error('View fetch error:', err)
        if (mounted) setViews(0)
      }
    }

    run()

    return () => {
      mounted = false
    }
  }, [id])

  if (views === null)
    return (
      <div className="view-container">
        <p className="view-text">Loading...</p>
      </div>
    )

  return (
    <div className="view-container">
      <p className="view-text">
        <span className="font-black">Views: {views}</span>
      </p>
    </div>
  )
}
