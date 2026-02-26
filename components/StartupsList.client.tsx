"use client"

import React, { useEffect, useState } from 'react'
import { client } from '@/sanity/lib/client'
import { STARTUPS_QUERY } from '@/sanity/lib/queries'
import StartupCard, { StartupTypeCard } from './StartupCard'

export default function StartupsList({ query }: { query?: string | null }) {
  const [posts, setPosts] = useState<StartupTypeCard[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const params = { search: query || null }

    setLoading(true)
    setError(null)

    client
      .fetch(STARTUPS_QUERY, params)
      .then((res) => {
        if (!mounted) return
        setPosts(res ?? [])
      })
      .catch((err) => {
        console.error('StartupsList fetch error:', err)
        if (!mounted) return
        setPosts([])
        setError(
          err?.message ||
            'Could not load startups. Please try again later.'
        )
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [query])

  if (loading) return <p className="mt-7">Loading startups...</p>

  if (error) {
    return (
      <div className="mt-7 rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-14-medium text-red-700">{error}</p>
        <p className="text-12-medium text-red-600 mt-1">
          Check Sanity env vars on Vercel (projectId/dataset/apiVersion) and that the dataset has published startups.
        </p>
      </div>
    )
  }

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
