export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { auth } from "@/auth";
import StartupForm from "@/components/StartupForm";
import { client } from "@/sanity/lib/client";
import { STARTUP_BY_ID_QUERY } from "@/sanity/lib/queries";
import { notFound, redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/");

  const { id } = await params;
  if (!id) return notFound();

  const post: any = await client.fetch(STARTUP_BY_ID_QUERY, { id: String(id) });
  if (!post) return notFound();

  const sessionUserId = (session as any)?.id ?? (session as any)?.user?.id;
  const authorRef = post?.author?._ref;
  const authorDocId = post?.author?._id;

  const isOwner = Boolean(
    sessionUserId && (sessionUserId === authorRef || sessionUserId === authorDocId)
  );

  if (!isOwner) redirect(`/startup/${id}`);

  // STARTUP_BY_ID_QUERY returns image as `image`.
  // The form expects `link` field name.
  return (
    <>
      <section className="pink_container !min-h-[230px]">
        <h1 className="heading">Edit Startup</h1>
      </section>

      <StartupForm
        mode="edit"
        startupId={id}
        initialValues={{
          title: post?.title ?? "",
          description: post?.description ?? "",
          category: post?.category ?? "",
          email: post?.contactEmail ?? "",
          link: post?.image ?? "",
          // `pitch` in Sanity is Portable Text; store as string in the editor.
          pitch:
            typeof post?.pitch === "string"
              ? post.pitch
              : Array.isArray(post?.pitch)
                ? post.pitch
                    .map((b: any) =>
                      Array.isArray(b?.children)
                        ? b.children.map((c: any) => c?.text ?? "").join("")
                        : ""
                    )
                    .join("\n\n")
                : "",
        }}
      />
    </>
  );
}
