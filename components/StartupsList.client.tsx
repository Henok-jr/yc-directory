"use client"

import React, { useEffect, useState } from 'react'
import { client } from '@/sanity/lib/client'
import { STARTUPS_QUERY } from '@/sanity/lib/queries'
import StartupCard, { StartupTypeCard } from './StartupCard'

export default function StartupsList({ query }: { query?: string | null }) {
  const [posts, setPosts] = useState<StartupTypeCard[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const params = { search: query || null }

    client
      .fetch(STARTUPS_QUERY, params)
      .then((res) => {
        if (!mounted) return
        // GROQ query returns an array of documents
        setPosts(res ?? [])
      })
      .catch((err) => {
        console.error('StartupsList fetch error:', err)
        if (mounted) setPosts([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

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
