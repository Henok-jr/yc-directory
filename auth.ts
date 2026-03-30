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
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
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

      if (!existingUser) {
        await writeClient.create({
          _type: "author",
          id: providerAccountId,
          name,
          username,
          email,
          image,
          bio: "",
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
      }
      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        Object.assign(session.user, { id: (token as any).id }); // fix for Vercel
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