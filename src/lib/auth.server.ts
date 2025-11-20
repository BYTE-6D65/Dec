import { SolidAuth, type SolidAuthConfig } from "@auth/solid-start";
import GitHub from "@auth/core/providers/github";
import { db } from "~/db/client";
import { users, linkedAccounts } from "~/db/schema";
import { eq, and } from "drizzle-orm";

export const authOpts: SolidAuthConfig = {
    providers: [
        GitHub({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ account, profile }) {
            if (!account || !profile) return false;

            const provider = account.provider;
            const providerUserId = account.providerAccountId;

            // 1. Check if this provider account already exists
            const existingLinked = await db
                .select()
                .from(linkedAccounts)
                .where(
                    and(
                        eq(linkedAccounts.provider, provider),
                        eq(linkedAccounts.providerUserId, providerUserId)
                    )
                )
                .limit(1);

            if (existingLinked.length > 0) {
                // Account already linked, allow sign in
                return true;
            }

            // 2. Create a new user
            const newUser = await db
                .insert(users)
                .values({
                    handle: (profile as any).login ?? (profile as any).name ?? "user",
                    role: "user",
                    settingsJson: "{}",
                })
                .returning();

            if (!newUser || newUser.length === 0) {
                return false;
            }

            // 3. Link this OAuth account to the new user
            await db.insert(linkedAccounts).values({
                userId: newUser[0].id,
                provider,
                providerUserId,
                accessTokenEncrypted: account.access_token ?? null,
                refreshTokenEncrypted: account.refresh_token ?? null,
                metadataJson: JSON.stringify(profile),
            });

            return true;
        },
        async session({ session, token }) {
            // Add user ID to session
            if (token?.sub) {
                // Find user by linked account
                const linked = await db
                    .select()
                    .from(linkedAccounts)
                    .where(eq(linkedAccounts.providerUserId, token.sub))
                    .limit(1);

                if (linked.length > 0) {
                    const user = await db
                        .select()
                        .from(users)
                        .where(eq(users.id, linked[0].userId))
                        .limit(1);

                    if (user.length > 0) {
                        session.user = {
                            ...session.user,
                            id: user[0].id,
                            role: user[0].role,
                        };
                    }
                }
            }
            return session;
        },
    },
};

export const { GET, POST } = SolidAuth(authOpts);
