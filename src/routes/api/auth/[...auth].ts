import { SolidAuth, type SolidAuthConfig } from "@auth/solid-start";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import Twitch from "@auth/core/providers/twitch";
import { db } from "~/db/client";
import { users, linkedAccounts } from "~/db/schema";
import { eq, and } from "drizzle-orm";

console.log('[AUTH] Environment variables check:');
console.log('[AUTH] GITHUB_ID:', process.env.GITHUB_ID ? 'SET' : 'MISSING');
console.log('[AUTH] GITHUB_SECRET:', process.env.GITHUB_SECRET ? 'SET' : 'MISSING');
console.log('[AUTH] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING');
console.log('[AUTH] GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING');
console.log('[AUTH] TWITCH_CLIENT_ID:', process.env.TWITCH_CLIENT_ID ? 'SET' : 'MISSING');
console.log('[AUTH] TWITCH_CLIENT_SECRET:', process.env.TWITCH_CLIENT_SECRET ? 'SET' : 'MISSING');
console.log('[AUTH] AUTH_SECRET:', process.env.AUTH_SECRET ? 'SET' : 'MISSING');

export const { GET, POST } = SolidAuth({
    basePath: "/api/auth",
    secret: process.env.AUTH_SECRET!,
    trustHost: true,
    providers: [
        GitHub({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
            authorization: {
                params: {
                    scope: 'openid email profile https://www.googleapis.com/auth/youtube.readonly'
                }
            }
        }),
        Twitch({
            clientId: process.env.TWITCH_CLIENT_ID || 'YOUR_TWITCH_CLIENT_ID',
            clientSecret: process.env.TWITCH_CLIENT_SECRET || 'YOUR_TWITCH_CLIENT_SECRET',
            authorization: {
                params: {
                    scope: 'user:read:email user:read:follows'
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            console.log('[AUTH] jwt callback triggered');
            console.log('[AUTH] token:', JSON.stringify(token, null, 2));
            console.log('[AUTH] account:', account ? 'present' : 'null');
            console.log('[AUTH] profile:', profile ? 'present' : 'null');

            // On sign-in, account and profile will be present
            if (account && profile) {
                console.log('[AUTH] First sign-in, adding provider info to token');
                token.provider = account.provider;
                token.providerAccountId = account.providerAccountId;
            }

            return token;
        },
        async signIn({ account, profile }) {
            console.log('[AUTH] signIn callback triggered');
            console.log('[AUTH] account:', JSON.stringify(account, null, 2));
            console.log('[AUTH] profile:', JSON.stringify(profile, null, 2));

            if (!account || !profile) {
                console.error('[AUTH] Missing account or profile');
                return false;
            }

            const provider = account.provider;
            const providerUserId = account.providerAccountId;

            console.log('[AUTH] Provider:', provider);
            console.log('[AUTH] Provider User ID:', providerUserId);

            // 1. Check if this provider account already exists
            try {
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

                console.log('[AUTH] Existing linked accounts found:', existingLinked.length);

                if (existingLinked.length > 0) {
                    console.log('[AUTH] Account already linked, allowing sign in');
                    return true;
                }
            } catch (error) {
                console.error('[AUTH] Error checking existing linked accounts:', error);
                return false;
            }

            // 2. Create a new user
            try {
                const handle = (profile as any).login ?? (profile as any).name ?? "user";
                console.log('[AUTH] Creating new user with handle:', handle);

                const newUser = await db
                    .insert(users)
                    .values({
                        handle,
                        role: "user",
                        settingsJson: "{}",
                    })
                    .returning();

                if (!newUser || newUser.length === 0) {
                    console.error('[AUTH] Failed to create new user');
                    return false;
                }

                console.log('[AUTH] New user created:', newUser[0].id);

                // 3. Link this OAuth account to the new user
                await db.insert(linkedAccounts).values({
                    userId: newUser[0].id,
                    provider,
                    providerUserId,
                    accessTokenEncrypted: account.access_token ?? null,
                    refreshTokenEncrypted: account.refresh_token ?? null,
                    metadataJson: JSON.stringify(profile),
                });

                console.log('[AUTH] OAuth account linked successfully');
                return true;
            } catch (error) {
                console.error('[AUTH] Error creating user or linking account:', error);
                return false;
            }
        },
        async session({ session, token }) {
            console.log('[AUTH] session callback triggered');
            console.log('[AUTH] token:', JSON.stringify(token, null, 2));
            console.log('[AUTH] session before enrichment:', JSON.stringify(session, null, 2));

            try {
                // Add user ID to session using the provider account ID
                if (token?.providerAccountId) {
                    console.log('[AUTH] Looking up user by providerAccountId:', token.providerAccountId);

                    // Find user by linked account
                    const linked = await db
                        .select()
                        .from(linkedAccounts)
                        .where(eq(linkedAccounts.providerUserId, token.providerAccountId as string))
                        .limit(1);

                    console.log('[AUTH] Linked accounts found:', linked.length);

                    if (linked.length > 0) {
                        const user = await db
                            .select()
                            .from(users)
                            .where(eq(users.id, linked[0].userId))
                            .limit(1);

                        console.log('[AUTH] Users found:', user.length);

                        if (user.length > 0) {
                            session.user = {
                                ...session.user,
                                id: user[0].id,
                                role: user[0].role,
                            };
                            console.log('[AUTH] Session enriched with user data');
                        }
                    } else {
                        console.warn('[AUTH] No linked account found for providerAccountId:', token.providerAccountId);
                    }
                } else {
                    console.warn('[AUTH] No providerAccountId in token');
                }

                console.log('[AUTH] session after enrichment:', JSON.stringify(session, null, 2));
                return session;
            } catch (error) {
                console.error('[AUTH] Error in session callback:', error);
                return session;
            }
        },
    },
});
