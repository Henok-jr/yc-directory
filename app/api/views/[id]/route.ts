import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'
import { writeClient } from '@/sanity/lib/write-client'
import { STARTUP_VIEWS_QUERY } from '@/sanity/lib/queries'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const doc = await client.withConfig({ useCdn: false }).fetch(STARTUP_VIEWS_QUERY, { id })
  return NextResponse.json({ views: doc?.views ?? 0 })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const doc = await client.withConfig({ useCdn: false }).fetch(STARTUP_VIEWS_QUERY, { id })
    const current = doc?.views ?? 0
    await writeClient.patch(id).set({ views: current + 1 }).commit()
    return NextResponse.json({ views: current + 1 })
  } catch (err) {
    console.error('views API error', err)
    return NextResponse.json({ error: 'Could not update views' }, { status: 500 })
  }
}
