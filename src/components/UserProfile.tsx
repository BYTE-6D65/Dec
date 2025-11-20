import { Show, createSignal, onMount } from "solid-js";
import { A } from "@solidjs/router";
import { isServer } from "solid-js/web";

export function UserProfile() {
    const [session, setSession] = createSignal<any>(null);
    const [loading, setLoading] = createSignal(true);

    // Fetch session only on client mount
    onMount(async () => {
        console.log('[CLIENT] Fetching session from /api/auth/session');
        try {
            const response = await fetch("/api/auth/session");
            console.log('[CLIENT] Session response status:', response.status);

            if (!response.ok) {
                const text = await response.text();
                console.error('[CLIENT] Session fetch failed:', response.status, text);
                setSession(null);
                setLoading(false);
                return;
            }

            const data = await response.json();
            console.log('[CLIENT] Session data:', JSON.stringify(data, null, 2));
            setSession(data);
            setLoading(false);
        } catch (error) {
            console.error('[CLIENT] Session fetch error:', error);
            setSession(null);
            setLoading(false);
        }
    });

    console.log('[CLIENT] UserProfile rendered, session:', session());

    return (
        <div class="flex items-center gap-3">
            <Show
                when={session()?.user}
                fallback={
                    <form action="/api/auth/signin/github" method="post">
                        <button
                            type="submit"
                            class="px-4 py-2 rounded border border-accent bg-bg-secondary text-text-primary hover:bg-accent hover:text-bg-primary transition-colors font-medium"
                            onClick={() => console.log('[CLIENT] Sign In button clicked')}
                        >
                            Sign In
                        </button>
                    </form>
                }
            >
                <div class="flex items-center gap-3">
                    <Show when={session()?.user?.image}>
                        <img
                            src={session()!.user!.image!}
                            alt="Profile"
                            class="w-8 h-8 rounded-full border-2 border-accent"
                        />
                    </Show>
                    <Show when={!session()?.user?.image}>
                        <div class="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-bg-primary font-bold">
                            {session()?.user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                    </Show>
                    <div class="flex flex-col">
                        <span class="text-sm text-text-primary font-medium">
                            {session()?.user?.name || "User"}
                        </span>
                        <Show when={session()?.user?.role}>
                            <span class="text-xs text-text-secondary">
                                {session()!.user!.role}
                            </span>
                        </Show>
                    </div>
                    <a
                        href="/api/auth/signout"
                        class="px-4 py-2 rounded border border-accent bg-bg-secondary text-text-primary hover:bg-accent hover:text-bg-primary transition-colors font-medium"
                    >
                        Sign Out
                    </a>
                </div>
            </Show>
        </div>
    );
}
