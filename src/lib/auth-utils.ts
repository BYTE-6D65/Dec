import { getSession } from "@auth/solid-start";

export interface SessionUser {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    role?: 'admin' | 'user';
}

/**
 * Get the current user from the session (server-side only)
 * Returns null if not authenticated
 */
export async function getSessionUser(request: Request): Promise<SessionUser | null> {
    try {
        const session = await getSession(request, {
            secret: process.env.AUTH_SECRET!,
        });

        if (!session?.user) {
            return null;
        }

        return session.user as SessionUser;
    } catch (error) {
        console.error('[AUTH] Error getting session:', error);
        return null;
    }
}

/**
 * Require authentication - throws 401 if not authenticated
 */
export async function requireAuth(request: Request): Promise<SessionUser> {
    const user = await getSessionUser(request);

    if (!user) {
        throw new Response(
            JSON.stringify({ error: 'Authentication required' }),
            {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    return user;
}

/**
 * Require admin role - throws 401 if not authenticated, 403 if not admin
 */
export async function requireAdmin(request: Request): Promise<SessionUser> {
    const user = await requireAuth(request);

    if (user.role !== 'admin') {
        throw new Response(
            JSON.stringify({ error: 'Admin access required' }),
            {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    return user;
}

/**
 * Check if user is admin (doesn't throw)
 */
export async function isAdmin(request: Request): Promise<boolean> {
    const user = await getSessionUser(request);
    return user?.role === 'admin';
}

/**
 * Check if user is authenticated (doesn't throw)
 */
export async function isAuthenticated(request: Request): Promise<boolean> {
    const user = await getSessionUser(request);
    return user !== null;
}
