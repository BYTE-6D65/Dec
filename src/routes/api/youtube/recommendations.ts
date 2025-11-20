import { json } from "@solidjs/router";
import { getSession } from "@auth/solid-start";
import { db } from "~/db/client";
import { linkedAccounts } from "~/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(event: any) {
    try {
        // Get current session
        const session = await getSession(event.request, {
            secret: process.env.AUTH_SECRET!,
        });

        if (!session?.user?.id) {
            return json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Get Google/YouTube linked account with access token
        const googleAccount = await db
            .select()
            .from(linkedAccounts)
            .where(
                and(
                    eq(linkedAccounts.userId, session.user.id),
                    eq(linkedAccounts.provider, 'google')
                )
            )
            .limit(1);

        if (!googleAccount || googleAccount.length === 0) {
            return json({
                error: 'Google account not linked',
                message: 'Please sign in with Google to see YouTube recommendations'
            }, { status: 404 });
        }

        const accessToken = googleAccount[0].accessTokenEncrypted;

        if (!accessToken) {
            return json({ error: 'No access token found' }, { status: 401 });
        }

        // Fetch YouTube recommendations
        // Using YouTube Data API v3 - Activities endpoint for recommended/suggested videos
        const response = await fetch(
            'https://www.googleapis.com/youtube/v3/activities?part=snippet,contentDetails&home=true&maxResults=5',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            console.error('[YOUTUBE API] Error:', response.status, await response.text());
            return json({ error: 'Failed to fetch YouTube recommendations' }, { status: response.status });
        }

        const data = await response.json();

        // Transform YouTube API response to our format
        const recommendations = data.items?.map((item: any) => {
            const videoId = item.contentDetails?.upload?.videoId ||
                           item.contentDetails?.playlistItem?.resourceId?.videoId;

            if (!videoId) return null;

            return {
                id: videoId,
                title: item.snippet?.title || 'Untitled Video',
                type: 'youtube',
                url: `https://www.youtube.com/embed/${videoId}`,
                thumbnail: item.snippet?.thumbnails?.medium?.url ||
                          `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                channelTitle: item.snippet?.channelTitle,
            };
        }).filter(Boolean) || [];

        return json(recommendations);
    } catch (error) {
        console.error('[YOUTUBE API] Error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}
