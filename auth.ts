import NextAuth from "next-auth";
import { getServerSession } from "next-auth";
import Google from "next-auth/providers/google";

import { AUTHOR_BY_GOOGLE_ID_QUERY } from "./sanity/lib/queries";
import { client } from "./sanity/lib/client";
import { writeClient } from "./sanity/lib/write-client";

export const { handlers, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }: any) {
      const name = user?.name ?? "";
      const email = user?.email ?? "";
      const image = user?.image ?? "";

      const googleId = (profile as any)?.sub;
      const username =
        (profile as any)?.given_name || (profile as any)?.name || name || "user";

      if (!googleId) return true;

      const existingUser = await client
        .withConfig({ useCdn: false })
        .fetch(AUTHOR_BY_GOOGLE_ID_QUERY, { id: googleId });

      if (!existingUser) {
        await writeClient.create({
          _type: "author",
          id: googleId,
          name,
          username,
          email,
          image,
          bio: "",
        });
      }

      return true;
    },

    async jwt({ token, account, profile }: any) {
      if (account && profile) {
        const googleId = (profile as any)?.sub;
        const user = await client
          .withConfig({ useCdn: false })
          .fetch(AUTHOR_BY_GOOGLE_ID_QUERY, { id: googleId });

        ;(token as any).id = user?._id;
      }
      return token;
    },

    async session({ session, token }: any) {
      ;(session as any).id = (token as any).id;
      return session;
    },
  },
});

export async function auth() {
  return getServerSession();
}
