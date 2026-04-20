<<<<<<< HEAD
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
=======
// auth.ts
import NextAuth from "next-auth/next";
import { getServerSession } from "next-auth/next";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";
import GoogleProvider from "next-auth/providers/google";

import { AUTHOR_BY_GITHUB_ID_QUERY } from "./sanity/lib/queries";
import { client } from "./sanity/lib/client";
import { writeClient } from "./sanity/lib/write-client";

export const authOptions: any = {
  providers: [
    GoogleProvider({
>>>>>>> 9b4a281013b39721a81ee44450413ca7ef95d6cc
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
<<<<<<< HEAD
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
=======
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, profile, account }: any) {
      const { name, email, image } = user ?? {};
      const providerAccountId = String((profile as any)?.sub ?? (profile as any)?.id ?? "");

      const username = email ? String(email).split("@")[0] : (profile as any)?.name;

      if (!providerAccountId) return true;

      const existingUser = await client
        .withConfig({ useCdn: false })
        .fetch(AUTHOR_BY_GITHUB_ID_QUERY, { id: providerAccountId });
>>>>>>> 9b4a281013b39721a81ee44450413ca7ef95d6cc

      if (!existingUser) {
        await writeClient.create({
          _type: "author",
<<<<<<< HEAD
          id: googleId,
=======
          id: providerAccountId,
>>>>>>> 9b4a281013b39721a81ee44450413ca7ef95d6cc
          name,
          username,
          email,
          image,
          bio: "",
<<<<<<< HEAD
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
=======
          provider: account?.provider,
        });
      }

      return true;
    },

    async jwt({ token, account, profile }: any) {
      if (account && profile) {
        const providerAccountId = String((profile as any)?.sub ?? (profile as any)?.id ?? "");
        const user = await client
          .withConfig({ useCdn: false })
          .fetch(AUTHOR_BY_GITHUB_ID_QUERY, { id: providerAccountId });
        (token as any).id = user?._id; // critical for production
>>>>>>> 9b4a281013b39721a81ee44450413ca7ef95d6cc
      }
      return token;
    },

    async session({ session, token }: any) {
<<<<<<< HEAD
      session.id = token.id;
      return session;
    },
  },
});
=======
  if (session.user) {
    // ✅ Assign token.id to session.user.id
    Object.assign(session.user, { id: token.id });
  }
  return session;
},
  },
};

// NextAuth route handler (used by app/api/auth/[...nextauth]/route.ts)
export const handler = NextAuth(authOptions);

// Server-side session helper (for server components/actions)
export async function auth() {
  return getServerSession(authOptions);
}

// Client-side signIn / signOut wrappers
export async function signIn(provider?: string, options?: any) {
  return nextAuthSignIn(provider, options);
}

export async function signOut(options?: any) {
  return nextAuthSignOut(options);
}
>>>>>>> 9b4a281013b39721a81ee44450413ca7ef95d6cc
