"use client"

import React, { useEffect, useState } from 'react'
import { client } from '@/sanity/lib/client'
import { STARTUPS_BY_AUTHOR_QUERY } from '@/sanity/lib/queries'
import StartupCard, { StartupTypeCard, StartupCardSkeleton } from './StartupCard'

export default function UserStartupsClient({ id }: { id: string }) {
  const [posts, setPosts] = useState<StartupTypeCard[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    client
      .fetch(STARTUPS_BY_AUTHOR_QUERY, { id })
      .then(res => { if (!mounted) return; setPosts(res ?? []) })
      .catch(err => { console.error('UserStartups fetch error', err); if (mounted) setPosts([]) })
      .finally(() => { if (mounted) setLoading(false) })

    return () => { mounted = false }
  }, [id])

  if (loading) return <StartupCardSkeleton />
  if (!posts || posts.length === 0) return <p className="no-result">No posts yet</p>

  return (
    <>
      {posts.map((startup: StartupTypeCard) => (
        <StartupCard key={startup._id} post={startup} />
      ))}
    </>
  )
}
