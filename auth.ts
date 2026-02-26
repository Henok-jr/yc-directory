import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

import { AUTHOR_BY_GITHUB_ID_QUERY } from "./sanity/lib/queries";
import { client } from "./sanity/lib/client";
import { writeClient } from "./sanity/lib/write-client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({ user, profile }: any) {
      // GitHub profile shape
      const id = profile?.id;
      const login = profile?.login;
      const bio = profile?.bio;

      const name = user?.name ?? "";
      const email = user?.email ?? "";
      const image = user?.image ?? "";

      if (!id) return false;

      const existingUser = await client
        .withConfig({ useCdn: false })
        .fetch(AUTHOR_BY_GITHUB_ID_QUERY, { id });

      if (!existingUser) {
        await writeClient.create({
          _type: "author",
          id,
          name,
          username: login ?? name,
          email,
          image,
          bio: bio || "",
        });
      }

      return true;
    },

    async jwt({ token, account, profile }: any) {
      if (account?.provider === "github" && profile?.id) {
        const user = await client
          .withConfig({ useCdn: false })
          .fetch(AUTHOR_BY_GITHUB_ID_QUERY, { id: profile.id });

        token.id = user?._id;
      }

      return token;
    },

    async session({ session, token }: any) {
      session.id = token.id;
      return session;
    },
  },
});