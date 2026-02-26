import NextAuthImport from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import {
  AUTHOR_BY_GITHUB_ID_QUERY,
  AUTHOR_BY_PROVIDER_ACCOUNT_ID_QUERY,
} from "./sanity/lib/queries"
import { client } from "./sanity/lib/client";
import { writeClient } from "./sanity/lib/write-client";

const NextAuth = NextAuthImport as any;
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub, Google],
  callbacks: {
    async signIn(params: any) {
      const { user, account, profile } = params;

      const provider = account?.provider as string | undefined;
      const providerAccountId = account?.providerAccountId as string | undefined;

      if (!provider || !providerAccountId) return false;

      const name = user?.name;
      const email = user?.email;
      const image = user?.image;

      const username =
        provider === "github" ? (profile as any)?.login : (profile as any)?.name;

      const bio = provider === "github" ? (profile as any)?.bio : "";

      // 1) Try provider-based lookup (works for both GitHub + Google)
      const existingByProvider = await client
        .withConfig({ useCdn: false })
        .fetch(AUTHOR_BY_PROVIDER_ACCOUNT_ID_QUERY, {
          provider,
          providerAccountId: String(providerAccountId),
        });

      if (existingByProvider) return true;

      // 2) Backwards compat for old GitHub authors created with numeric `id`
      const legacyGithubId = provider === "github" ? (profile as any)?.id : null;
      const legacyUser = legacyGithubId
        ? await client
            .withConfig({ useCdn: false })
            .fetch(AUTHOR_BY_GITHUB_ID_QUERY, { id: legacyGithubId })
        : null;

      if (legacyUser) {
        await writeClient
          .patch(legacyUser._id)
          .set({
            provider,
            providerAccountId: String(providerAccountId),
            email,
            image,
            name,
            username,
          })
          .commit();

        return true;
      }

      // 3) Create new author
      await writeClient.create({
        _type: "author",
        ...(provider === "github" ? { id: legacyGithubId } : {}),
        provider,
        providerAccountId: String(providerAccountId),
        name,
        username,
        email,
        image,
        bio: bio || "",
      });

      return true;
    },
    async jwt(params: any) {
      const { token, account } = params;

      if (account) {
        const provider = account?.provider as string | undefined;
        const providerAccountId = account?.providerAccountId as string | undefined;

        if (provider && providerAccountId) {
          const author = await client
            .withConfig({ useCdn: false })
            .fetch(AUTHOR_BY_PROVIDER_ACCOUNT_ID_QUERY, {
              provider,
              providerAccountId: String(providerAccountId),
            });

          token.id = author?._id;
        }
      }

      return token;
    },
    async session({ session, token }: any) {
      Object.assign(session, { id: token.id });
      return session;
    },
  },
});