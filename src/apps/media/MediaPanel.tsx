import { Component, createSignal, For, Show } from "solid-js";

const mediaItems = [
    { id: "1", title: "Lofi Hip Hop Radio", type: "video", url: "https://www.youtube.com/embed/jfKfPfyJRdk", thumbnail: "https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg" },
    { id: "2", title: "Synthwave Mix", type: "video", url: "https://www.youtube.com/embed/4xDzrJKXOOY", thumbnail: "https://img.youtube.com/vi/4xDzrJKXOOY/mqdefault.jpg" },
    { id: "3", title: "Ambient Coding", type: "video", url: "https://www.youtube.com/embed/9FvvbVI5rYA", thumbnail: "https://img.youtube.com/vi/9FvvbVI5rYA/mqdefault.jpg" },
];

export const MediaPanel: Component = () => {
    const [currentMedia, setCurrentMedia] = createSignal<string | null>(null);
    const [inputUrl, setInputUrl] = createSignal("");

    const handlePlayUrl = (e: Event) => {
        e.preventDefault();
        if (inputUrl()) {
            // Basic YouTube embed transformation for demo purposes
            let url = inputUrl();
            if (url.includes("watch?v=")) {
                url = url.replace("watch?v=", "embed/");
            }
            setCurrentMedia(url);
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
                            <p>Select media to play</p>
                        </div>
                    </div>
                }>
                    <iframe
                        src={currentMedia()!}
                        class="w-full h-full border-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    />
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
                            placeholder="https://youtube.com/..."
                        />
                        <button class="w-full bg-surface-highlight hover:bg-accent hover:text-background text-text-main text-sm font-bold py-2 rounded transition-colors">
                            Play
                        </button>
                    </form>
                </div>

                {/* Gallery */}
                <div class="flex-1 bg-surface p-4 rounded-lg border border-border overflow-x-auto">
                    <h3 class="font-bold text-sm text-text-muted uppercase tracking-wider mb-4">Library</h3>
                    <div class="flex gap-4">
                        <For each={mediaItems}>
                            {(item) => (
                                <div
                                    onClick={() => setCurrentMedia(item.url)}
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
            </div>
        </div>
    );
};
