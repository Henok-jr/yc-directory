import Image from "next/image";
import SearchForm from "@/components/SearchForm";
import StartupCard, { StartupTypeCard } from "@/components/StartupCard";
import { STARTUPS_QUERY } from "@/sanity/lib/queries";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";
import { auth } from "@/auth";
import { cache } from "react";
import StartupsListClient from '@/components/StartupsList.client'
import SessionLoggerClient from '@/components/SessionLogger.client'

// Cache the auth call to prevent blocking the route
const cachedAuth = cache(() => auth());

export default function Home(props: { searchParams: Promise<{ query?: string }> }) {
  return <HomeContent {...props} />
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

        {/* Client-loaded non-blocking startup list */}
        <StartupsListClient query={query} />
      </section>

      <SanityLive />

      {/* Client-side session logger to avoid blocking */}
      <SessionLoggerClient />
    </>
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