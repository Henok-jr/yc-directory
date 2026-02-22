import Image from "next/image";
import SearchForm from "@/components/SearchForm";
import StartupCard, { StartupTypeCard } from "@/components/StartupCard";
import { STARTUPS_QUERY } from "@/sanity/lib/queries";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";
import { auth } from "@/auth";
import { cache, Suspense } from "react";

// Cache the auth call to prevent blocking the route
const cachedAuth = cache(() => auth());

export default function Home({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
  // Render an async child that uses runtime data inside Suspense so the route can stream immediately.
  return (
    <Suspense fallback={<p className="mt-7">Loading...</p>}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}

// Async server component that can safely await runtime data (searchParams)
async function HomeContent({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
  const query = (await searchParams).query;

  // Defer auth to a Suspense-wrapped child to avoid blocking the route
  return (
    <>
      <section className="pink_container">
        <h1 className="heading">
          Pitch Your Startup, <br />
          Connect With Entrepreneurs
        </h1>
        <p className="sub-heading !max-w-3xl">
          Submit Ideas, Vote on pitches, and Get Noticed in Virtual Competitions.
        </p>

        <SearchForm query={query} />
      </section>

      <section className="section_container">
        <p className="text-30-semibold">
          {query ? `Search results for "${query}"` : "All Startups"}
        </p>

        {/* Suspense for non-blocking startup list */}
        <Suspense fallback={<p className="mt-7">Loading startups...</p>}>
          <StartupsList query={query} />
        </Suspense>
      </section>

      <SanityLive />

      {/* Defer auth to avoid blocking navigation */}
      <Suspense fallback={null}>
        <SessionLogger />
      </Suspense>
    </>
  );
}

// Async child component to fetch startups
async function StartupsList({ query }: { query?: string | null }) {
  const params = { search: query || null };
  const { data: posts } = await sanityFetch({ query: STARTUPS_QUERY, params });

  if (!posts || posts.length === 0) {
    return <p className="no-results mt-7">No startups found</p>;
  }

  return (
    <ul className="mt-7 card_grid">
      {posts.map((post: StartupTypeCard) => (
        <StartupCard key={post._id} post={post} />
      ))}
    </ul>
  );
}

// Async server component that performs auth without blocking the parent route.
async function SessionLogger() {
  try {
    const session = await cachedAuth();
    console.log(session?.id);
  } catch (e) {
    console.error("SessionLogger error:", e);
  }
  return null;
}