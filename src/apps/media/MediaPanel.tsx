import { Component, createSignal, For, Show, onMount, createResource } from "solid-js";

interface MediaSource {
    type: 'youtube' | 'twitch' | 'video';
    url: string;
}

interface MediaItem {
    id: string;
    title: string;
    type: string;
    url: string;
    thumbnail: string;
    channelTitle?: string;
    viewerCount?: number;
    gameName?: string;
}

const staticMediaItems: MediaItem[] = [
    { id: "1", title: "Lofi Hip Hop Radio", type: "video", url: "https://www.youtube.com/embed/jfKfPfyJRdk", thumbnail: "https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg" },
    { id: "2", title: "Synthwave Mix", type: "video", url: "https://www.youtube.com/embed/4xDzrJKXOOY", thumbnail: "https://img.youtube.com/vi/4xDzrJKXOOY/mqdefault.jpg" },
    { id: "3", title: "Ambient Coding", type: "video", url: "https://www.youtube.com/embed/9FvvbVI5rYA", thumbnail: "https://img.youtube.com/vi/9FvvbVI5rYA/mqdefault.jpg" },
];

async function fetchYouTubeRecommendations(): Promise<MediaItem[]> {
    try {
        const response = await fetch('/api/youtube/recommendations');
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('[MEDIA] YouTube fetch error:', error);
        return [];
    }
}

async function fetchTwitchFollowing(): Promise<MediaItem[]> {
    try {
        const response = await fetch('/api/twitch/following');
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('[MEDIA] Twitch fetch error:', error);
        return [];
    }
}

function parseMediaUrl(url: string): MediaSource {
    // YouTube detection and transformation
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';

        if (url.includes('watch?v=')) {
            videoId = url.split('watch?v=')[1]?.split('&')[0] || '';
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
        } else if (url.includes('embed/')) {
            videoId = url.split('embed/')[1]?.split('?')[0] || '';
        }

        return {
            type: 'youtube',
            url: `https://www.youtube.com/embed/${videoId}`
        };
    }

    // Twitch detection and transformation
    if (url.includes('twitch.tv')) {
        let channel = '';

        if (url.includes('twitch.tv/videos/')) {
            const videoId = url.split('videos/')[1]?.split('?')[0] || '';
            return {
                type: 'twitch',
                url: `https://player.twitch.tv/?video=${videoId}&parent=${window.location.hostname}`
            };
        } else {
            // Live channel
            channel = url.split('twitch.tv/')[1]?.split('?')[0] || '';
            return {
                type: 'twitch',
                url: `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}`
            };
        }
    }

    // Direct video file detection (MP4, MPV, WebM, etc.)
    if (url.match(/\.(mp4|mpv|webm|ogg|mov|avi)(\?|$)/i)) {
        return {
            type: 'video',
            url: url
        };
    }

    // Default: treat as direct video or iframe-able URL
    return {
        type: 'video',
        url: url
    };
}

export const MediaPanel: Component = () => {
    const [currentMedia, setCurrentMedia] = createSignal<MediaSource | null>(null);
    const [inputUrl, setInputUrl] = createSignal("");
    const [youtubeRecs] = createResource(fetchYouTubeRecommendations);
    const [twitchStreams] = createResource(fetchTwitchFollowing);

    const handlePlayUrl = (e: Event) => {
        e.preventDefault();
        if (inputUrl()) {
            const parsed = parseMediaUrl(inputUrl());
            setCurrentMedia(parsed);
        }
    };

    return (
        <div class="h-full flex flex-col gap-6">
            {/* Player Area */}
            <div class="flex-1 bg-background rounded-lg overflow-hidden border border-border relative group">
                <Show when={currentMedia()} fallback={
                    <div class="absolute inset-0 flex items-center justify-center text-text-muted bg-surface">
                        <div class="text-center">
                            <span class="text-6xl block mb-4 opacity-50">▶</span>
                            <p class="text-sm">Select media or paste a URL</p>
                            <p class="text-xs text-text-faint mt-2">Supports: YouTube, Twitch, MP4, WebM, MPV</p>
                        </div>
                    </div>
                }>
                    <Show when={currentMedia()!.type === 'video'}>
                        <video
                            src={currentMedia()!.url}
                            class="w-full h-full"
                            controls
                            autoplay
                        />
                    </Show>
                    <Show when={currentMedia()!.type === 'youtube' || currentMedia()!.type === 'twitch'}>
                        <iframe
                            src={currentMedia()!.url}
                            class="w-full h-full border-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                        />
                    </Show>
                </Show>
            </div>

            {/* Controls & Gallery */}
            <div class="h-48 flex gap-6">
                {/* URL Input */}
                <div class="w-1/3 bg-surface p-4 rounded-lg border border-border">
                    <h3 class="font-bold text-sm text-text-muted uppercase tracking-wider mb-4">Load URL</h3>
                    <form onSubmit={handlePlayUrl} class="space-y-2">
                        <input
                            type="text"
                            value={inputUrl()}
                            onInput={(e) => setInputUrl(e.currentTarget.value)}
                            class="w-full bg-background border border-border rounded p-2 text-text-main text-sm outline-none focus:border-accent transition-colors"
                            placeholder="YouTube, Twitch, or video URL..."
                        />
                        <button class="w-full bg-surface-highlight hover:bg-accent hover:text-background text-text-main text-sm font-bold py-2 rounded transition-colors">
                            Play
                        </button>
                    </form>
                </div>

                {/* Gallery */}
                <div class="flex-1 bg-surface p-4 rounded-lg border border-border overflow-y-auto">
                    {/* YouTube Recommendations */}
                    <Show when={(youtubeRecs() && youtubeRecs()!.length > 0) || youtubeRecs.loading}>
                        <div class="mb-6">
                            <h3 class="font-bold text-sm text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                                <span>YouTube Recommendations</span>
                                <Show when={youtubeRecs.loading}>
                                    <span class="text-xs text-text-faint">Loading...</span>
                                </Show>
                            </h3>
                            <div class="flex gap-4 overflow-x-auto pb-2">
                                <For each={youtubeRecs()}>
                                    {(item) => (
                                        <div
                                            onClick={() => setCurrentMedia(parseMediaUrl(item.url))}
                                            class="flex-shrink-0 w-40 cursor-pointer group"
                                        >
                                            <div class="aspect-video bg-background rounded overflow-hidden border border-transparent group-hover:border-accent transition-all mb-2 relative">
                                                <img src={item.thumbnail} alt={item.title} class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span class="text-text-main drop-shadow-md text-2xl">▶</span>
                                                </div>
                                            </div>
                                            <p class="text-xs text-text-muted group-hover:text-text-main truncate transition-colors">{item.title}</p>
                                            <Show when={item.channelTitle}>
                                                <p class="text-xs text-text-faint truncate">{item.channelTitle}</p>
                                            </Show>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </div>
                    </Show>

                    {/* Twitch Live Streams */}
                    <Show when={(twitchStreams() && twitchStreams()!.length > 0) || twitchStreams.loading}>
                        <div class="mb-6">
                            <h3 class="font-bold text-sm text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                                <span class="text-red-500">●</span>
                                <span>Live on Twitch</span>
                                <Show when={twitchStreams.loading}>
                                    <span class="text-xs text-text-faint">Loading...</span>
                                </Show>
                            </h3>
                            <div class="flex gap-4 overflow-x-auto pb-2">
                                <For each={twitchStreams()}>
                                    {(item) => (
                                        <div
                                            onClick={() => setCurrentMedia(parseMediaUrl(item.url))}
                                            class="flex-shrink-0 w-40 cursor-pointer group"
                                        >
                                            <div class="aspect-video bg-background rounded overflow-hidden border border-transparent group-hover:border-accent transition-all mb-2 relative">
                                                <img src={item.thumbnail} alt={item.title} class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span class="text-text-main drop-shadow-md text-2xl">▶</span>
                                                </div>
                                                <div class="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded font-bold">
                                                    LIVE
                                                </div>
                                                <Show when={item.viewerCount}>
                                                    <div class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                                                        {item.viewerCount?.toLocaleString()} viewers
                                                    </div>
                                                </Show>
                                            </div>
                                            <p class="text-xs text-text-muted group-hover:text-text-main truncate transition-colors">{item.title}</p>
                                            <p class="text-xs text-text-faint truncate">{item.channelTitle}</p>
                                            <Show when={item.gameName}>
                                                <p class="text-xs text-text-faint truncate">{item.gameName}</p>
                                            </Show>
                                        </div>
                                    )}
                                </For>
                            </div>
                        </div>
                    </Show>

                    {/* Static Library */}
                    <div>
                        <h3 class="font-bold text-sm text-text-muted uppercase tracking-wider mb-3">Static Library</h3>
                        <div class="flex gap-4 overflow-x-auto pb-2">
                            <For each={staticMediaItems}>
                                {(item) => (
                                    <div
                                        onClick={() => setCurrentMedia(parseMediaUrl(item.url))}
                                        class="flex-shrink-0 w-40 cursor-pointer group"
                                    >
                                        <div class="aspect-video bg-background rounded overflow-hidden border border-transparent group-hover:border-accent transition-all mb-2 relative">
                                            <img src={item.thumbnail} alt={item.title} class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span class="text-text-main drop-shadow-md text-2xl">▶</span>
                                            </div>
                                        </div>
                                        <p class="text-xs text-text-muted group-hover:text-text-main truncate transition-colors">{item.title}</p>
                                    </div>
                                )}
                            </For>
                        </div>
                    </div>

                    {/* Link Accounts Message */}
                    <Show when={!youtubeRecs.loading && !twitchStreams.loading && (!youtubeRecs() || youtubeRecs()!.length === 0) && (!twitchStreams() || twitchStreams()!.length === 0)}>
                        <div class="mt-4 p-4 bg-background rounded border border-border">
                            <p class="text-sm text-text-muted mb-2">📺 Link your accounts for personalized content!</p>
                            <p class="text-xs text-text-faint">Sign in with Google to see YouTube recommendations, or Twitch to see live streams from channels you follow.</p>
                        </div>
                    </Show>
                </div>
            </div>
        </div>
    );
};
