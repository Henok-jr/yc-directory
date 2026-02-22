import "server-only";

import { client } from "@/sanity/lib/client";

export async function sanityFetch({ query, params }: { query: string; params?: Record<string, any> }) {
  try {
    const data = await client.fetch(query, params);
    return { data };
  } catch (error) {
    // Log and return a safe shape the app expects
    console.error("sanityFetch error:", error);
    return { data: null, error };
  }
}

// No-op fallback component for environments without the live preview helper.
// This keeps existing imports working and avoids Turbopack errors.
export function SanityLive(): null {
  return null;
}