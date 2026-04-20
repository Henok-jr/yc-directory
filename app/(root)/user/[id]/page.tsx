import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { AUTHOR_BY_ID_QUERY } from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import Image from "next/image";
import { User } from "lucide-react";
import StartupCard, { StartupCardSkeleton } from "@/components/StartupCard";
import UserStartupsClient from '@/components/UserStartups.client'

export const dynamic = "force-dynamic";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;
  const session = await auth();

  let user;
  try {
    const sanity = client.withConfig({ useCdn: false });

    // 1) Try by Sanity document _id (existing behavior)
    user = await sanity.fetch(AUTHOR_BY_ID_QUERY, { id });

    // 2) Fallback: some links/providers use `author.id` (OAuth subject). Try resolving that too.
    if (!user) {
      user = await sanity.fetch(
        `*[_type == "author" && id == $id][0]{
          _id,
          id,
          name,
          username,
          email,
          image,
          bio
        }`,
        { id }
      );
    }
  } catch (err) {
    console.error("Sanity fetch error (AUTHOR):", err);
    throw err;
  }

  if (!user) return notFound();

  return (
    <>
      <section className=" profile_container">
        <div className="profile_card">
          <div className="profile_title">
            <h3 className="text-24-black uppercase text-center line-clamp-1">
              {user.name}
            </h3>
          </div>

          <Image
            src={user.image || "/logo.png"}
            alt={user.name || "Profile image"}
            width={220}
            height={200}
            className="profile_image"
          />

          {/* Username hidden */}

          {user?.email ? (
            <p
              className="mt-2 text-sm text-white/80 text-center w-full max-w-full px-2 break-all overflow-hidden"
              title={user.email}
            >
              {user.email}
            </p>
          ) : null}

          <p className="mt-1 text-center text-14-normal">{user?.bio}</p>
        </div>

        <div className="flex-1 flex flex-col gap-5 lg:-mt-5">
          <p className="text-30-bold">
            {session?.id == id ? "Your" : "All"} Startups
          </p>

          <ul className="card_grid-sm">
            <UserStartupsClient id={id} />
          </ul>
        </div>
      </section>
    </>
  );
};

export default page;