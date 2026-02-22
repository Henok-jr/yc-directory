import { formatDate } from '@/lib/utils';
import { client } from '@/sanity/lib/client';
import { PLAYLIST_BY_SLUG_QUERY, STARTUP_BY_ID_QUERY } from '@/sanity/lib/queries';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import View from '@/components/View';
import { Startup } from '@/sanity/types';
import StartupCard, { StartupTypeCard } from '@/components/StartupCard';

// ✅ IMPORTANT: params is a Promise in Next 16
const Page = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const post = await client.fetch(STARTUP_BY_ID_QUERY, { id });

  // Try multiple possible slugs for the editors picks playlist (users may create 'editors picks')
  const possibleSlugs = ['editors-picks', 'editors-picks-new'];
  let playlist: any = null;
  let matchedSlug: string | null = null;
  for (const s of possibleSlugs) {
    // fetch until we find a matching playlist
    const res = await client.fetch(PLAYLIST_BY_SLUG_QUERY, { slug: s });
    if (res) {
      playlist = res;
      matchedSlug = s;
      break;
    }
  }
  console.log('PLAYLIST fetch result (matchedSlug):', matchedSlug, playlist);
  const editorPosts: StartupTypeCard[] = (playlist?.select as StartupTypeCard[]) ?? [];

  if (!post) return notFound();

  // Normalize pitch: PortableText expects an array of block objects.
  // Some documents may have pitch saved as a plain string; convert that into a block array.
  let pitchValue = post.pitch;
  if (typeof pitchValue === 'string' && pitchValue.length > 0) {
    pitchValue = [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: pitchValue,
          },
        ],
      },
    ];
  }

  return (
    <>
      <section className="pink_container !min-h-[230px]">
        <p className="tag">{formatDate(post._createdAt)}</p>
        <h1 className="heading">{post.title}</h1>
        <p className="sub-heading !max-w-5xl">{post.description}</p>
      </section>

      <section className="section_container">
        <img
          src={post.image}
          alt="thumbnail"
          className="w-full h-auto rounded-xl"
        />

        <div className="space-y-5 mt-10 max-w-4xl mx-auto">
          <div className="flex-between gap-5">
            <Link
              href={`/user/${post.author?._id}`}
              className="flex gap-2 items-center mb-3"
            >
              <Image
                src={post.author.image}
                alt="avatar"
                width={64}
                height={64}
                className="rounded-full drop-shadow-lg"
              />
              <div>
                <p className="text-20-medium">{post.author.name}</p>
                <p className="text-16-medium !text-black-300">
                  @{post.author.username}
                </p>
              </div>
            </Link>
            <p className="category-tag">{post.category}</p>
          </div>

          <h3 className="text-30-bold">Pitch Details</h3>

          {pitchValue && pitchValue.length > 0 ? (
            <article className="prose max-w-4xl font-work-sans break-all">
              <PortableText value={pitchValue} />
            </article>
          ) : (
            <p className="no-result">No details provided</p>
          )}
        </div>

        <hr className="divider" />

        {editorPosts?.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <p className=" text-30-semibold">Editor picks</p>
            <ul className=" mt-7 card_grid-sm">
             {editorPosts.map((post: StartupTypeCard, i: number) => (
                <StartupCard key={i} post={post} />
             ))}
            </ul>

          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <p className="text-16-medium !text-black-300">No editor picks available. Create a playlist with slug <code>editors-picks-new</code> in Sanity and add startups to its <strong>select</strong> array.</p>
          </div>
        )}

        <Suspense fallback={<Skeleton className="view_skeleton"/>}>
          <View id={id} />
        </Suspense>
      </section>
    </>
  );
};

export default Page;