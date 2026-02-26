"use client"

import React, { useEffect, useState } from 'react'
import { client } from '@/sanity/lib/client'
import { STARTUPS_BY_AUTHOR_QUERY } from '@/sanity/lib/queries'
import StartupCard, { StartupTypeCard, StartupCardSkeleton } from './StartupCard'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function UserStartupsClient({ id }: { id: string }) {
  const { data: session } = useSession()
  const isOwner = (session as any)?.id === id

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

  if (!posts || posts.length === 0)
    return (
      <div className="w-full rounded-2xl border bg-white p-6">
        <p className="text-16-medium text-black-300">
          {isOwner ? "You haven't created any startups yet." : "This user hasn't created any startups yet."}
        </p>

        {isOwner ? (
          <div className="mt-4">
            <Button asChild className="startup-card_btn">
              <Link href="/startup/create">Create your first startup</Link>
            </Button>
          </div>
        ) : null}
      </div>
    )

  return (
    <>
      {posts.map((startup: StartupTypeCard) => (
        <StartupCard key={startup._id} post={startup} />
      ))}
    </>
  )
}
