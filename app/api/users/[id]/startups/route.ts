import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { STARTUPS_BY_AUTHOR_QUERY } from "@/sanity/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const startups = await client
      .withConfig({ useCdn: false })
      .fetch(STARTUPS_BY_AUTHOR_QUERY, { id });

    return NextResponse.json({ startups: startups ?? [] });
  } catch (error) {
    console.error("/api/users/[id]/startups error", error);
    return NextResponse.json(
      { startups: [], error: "Failed to fetch user startups" },
      { status: 500 }
    );
  }
}
