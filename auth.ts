// next-auth v5 beta types sometimes report the default export as non-callable.
// Use a require-import to obtain the runtime callable default export.
const NextAuth = require("next-auth").default as any;

import Google from "next-auth/providers/google";

import { AUTHOR_BY_GOOGLE_ID_QUERY } from "./sanity/lib/queries";
import { client } from "./sanity/lib/client";
import { writeClient } from "./sanity/lib/write-client";

export const { handlers, auth, signIn, signOut } = NextAuth({
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

      const googleId = profile?.sub;
      const username = profile?.given_name || profile?.name || name || "user";

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
        const googleId = profile?.sub;
        const user = await client
          .withConfig({ useCdn: false })
          .fetch(AUTHOR_BY_GOOGLE_ID_QUERY, { id: googleId });

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