"use client"

import React, { useEffect, useState } from 'react'
import Ping from '@/components/Ping'

export default function ViewClient({ id }: { id: string }) {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    // GET current views via API route
    fetch(`/api/views/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        setViews(data.views ?? 0)
        // Increment views in background
        fetch(`/api/views/${id}`, { method: 'POST' }).catch(console.error)
      })
      .catch((err) => {
        console.error('View fetch error:', err)
        if (mounted) setViews(0)
      })

    return () => { mounted = false }
  }, [id])

  if (views === null) return <div className="view-container"><Ping /><p className="view-text">Loading...</p></div>

  return (
    <div className="view-container">
      <div className="absolute -top-2 -right-2"><Ping /></div>
      <p className="view-text"><span className="font-black">Views: {views}</span></p>
    </div>
  )
}
