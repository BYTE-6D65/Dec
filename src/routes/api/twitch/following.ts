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

        // Get Twitch linked account with access token
        const twitchAccount = await db
            .select()
            .from(linkedAccounts)
            .where(
                and(
                    eq(linkedAccounts.userId, session.user.id),
                    eq(linkedAccounts.provider, 'twitch')
                )
            )
            .limit(1);

        if (!twitchAccount || twitchAccount.length === 0) {
            return json({
                error: 'Twitch account not linked',
                message: 'Please sign in with Twitch to see followed streams'
            }, { status: 404 });
        }

        const accessToken = twitchAccount[0].accessTokenEncrypted;
        const metadata = JSON.parse(twitchAccount[0].metadataJson || '{}');
        const twitchUserId = metadata.id || metadata.sub;

        if (!accessToken || !twitchUserId) {
            return json({ error: 'Missing Twitch credentials' }, { status: 401 });
        }

        // Get followed channels
        const followsResponse = await fetch(
            `https://api.twitch.tv/helix/channels/followed?user_id=${twitchUserId}&first=10`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': process.env.TWITCH_CLIENT_ID || '',
                },
            }
        );

        if (!followsResponse.ok) {
            console.error('[TWITCH API] Follows error:', followsResponse.status, await followsResponse.text());
            return json({ error: 'Failed to fetch followed channels' }, { status: followsResponse.status });
        }

        const followsData = await followsResponse.json();
        const followedChannelIds = followsData.data?.map((f: any) => f.broadcaster_id) || [];

        if (followedChannelIds.length === 0) {
            return json([]);
        }

        // Check which followed channels are currently live
        const streamsResponse = await fetch(
            `https://api.twitch.tv/helix/streams?user_id=${followedChannelIds.join('&user_id=')}&first=5`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': process.env.TWITCH_CLIENT_ID || '',
                },
            }
        );

        if (!streamsResponse.ok) {
            console.error('[TWITCH API] Streams error:', streamsResponse.status, await streamsResponse.text());
            return json({ error: 'Failed to fetch live streams' }, { status: streamsResponse.status });
        }

        const streamsData = await streamsResponse.json();

        // Transform Twitch API response to our format
        const liveStreams = streamsData.data?.map((stream: any) => ({
            id: stream.id,
            title: stream.title,
            type: 'twitch',
            url: `https://player.twitch.tv/?channel=${stream.user_login}&parent=${process.env.AUTH_URL?.replace('http://', '').replace('https://', '') || 'localhost'}`,
            thumbnail: stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180'),
            channelTitle: stream.user_name,
            viewerCount: stream.viewer_count,
            gameName: stream.game_name,
        })) || [];

        return json(liveStreams);
    } catch (error) {
        console.error('[TWITCH API] Error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}
