import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { STARTUP_FOR_EDIT_QUERY } from "@/sanity/lib/queries";
import { notFound, redirect } from "next/navigation";
import StartupForm from "@/components/StartupForm";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session) redirect("/");
  if (!id) return notFound();

  const startup = await client
    .withConfig({ useCdn: false })
    .fetch(STARTUP_FOR_EDIT_QUERY, { id });

  if (!startup) return notFound();

  const ownerId = startup?.author?._id;
  if (!ownerId || ownerId !== session.id) return notFound();

  // pitch is stored as Portable Text array. Convert it to plain text for the editor.
  const pitchText = Array.isArray(startup.pitch)
    ? startup.pitch
        .map((b: any) =>
          Array.isArray(b?.children)
            ? b.children.map((c: any) => c?.text ?? "").join("")
            : ""
        )
        .join("\n\n")
    : "";

  return (
    <>
      <section className="pink_container !min-h-[230px]">
        <h1 className="heading">Edit Startup</h1>
      </section>

      <StartupForm
        mode="edit"
        startupId={id}
        initialValues={{
          title: startup.title,
          description: startup.description,
          category: startup.category,
          contactEmail: startup.contactEmail,
          link: startup.image,
          pitch: pitchText,
        }}
      />
    </>
  );
}
