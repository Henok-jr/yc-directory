import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { STARTUPS_QUERY } from "@/sanity/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  try {
    const startups = await client
      .withConfig({ useCdn: false })
      .fetch(STARTUPS_QUERY, { search: query || null });

    return NextResponse.json({ startups: startups ?? [] });
  } catch (error) {
    console.error("/api/startups error", error);
    return NextResponse.json(
      { startups: [], error: "Failed to fetch startups" },
      { status: 500 }
    );
  }
}
