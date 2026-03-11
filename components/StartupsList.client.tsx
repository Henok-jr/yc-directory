"use client"

import React, { useEffect, useState } from 'react'
import StartupCard, { StartupTypeCard } from './StartupCard'

export default function StartupsList({ query }: { query?: string | null }) {
  const [posts, setPosts] = useState<StartupTypeCard[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const run = async () => {
      try {
        const qs = query ? `?query=${encodeURIComponent(query)}` : ''
        const res = await fetch(`/api/startups${qs}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!mounted) return
        setPosts(data?.startups ?? [])
      } catch (err) {
        console.error('[StartupsList] fetch error', err)
        if (mounted) setPosts([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    run()

    return () => {
      mounted = false
    }
  }, [query])

  if (loading) return <p className="mt-7">Loading startups...</p>

  if (!posts || posts.length === 0) {
    return <p className="no-results mt-7">No startups found</p>
  }

  return (
    <ul className="mt-7 card_grid">
      {posts.map((post: StartupTypeCard) => (
        <StartupCard key={post._id} post={post} />
      ))}
    </ul>
  )
}
