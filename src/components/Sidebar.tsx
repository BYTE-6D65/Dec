import { Component, createSignal, onMount, Show, For } from "solid-js";
import { panelState, PanelId } from "../state/panelState";
import { NAVIGATION_PANELS } from "~/config/navigation";

const SidebarItem: Component<{ id: PanelId; label: string; icon: string }> = (props) => {
    const isActive = () => panelState.activePanel() === props.id;

    return (
        <button
            onClick={() => panelState.setActivePanel(props.id)}
            class={`w-full p-4 flex flex-col items-center justify-center transition-colors duration-200 group ${isActive() ? "text-accent bg-surface" : "text-text-faint hover:text-text-main hover:bg-surface/50"
                }`}
            aria-label={props.label}
        >
            <Show
                when={props.icon === 'gear'}
                fallback={<span class="text-2xl mb-1">{props.icon}</span>}
            >
                <svg
                    class="w-6 h-6 mb-1"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                >
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </Show>
            <span class="text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {props.label}
            </span>
        </button>
    );
};

export const Sidebar: Component = () => {
    const [session, setSession] = createSignal<any>(null);

    // Fetch session only on client mount
    onMount(async () => {
        try {
            const response = await fetch("/api/auth/session");
            if (response.ok) {
                const data = await response.json();
                setSession(data);
            }
        } catch (error) {
            console.error('[SIDEBAR] Session fetch error:', error);
        }
    });

    return (
        <aside class={`w-20 h-full bg-background flex flex-col items-center py-4 z-10 ${panelState.sidebarPosition() === 'left' ? 'border-r border-border' : 'border-l border-border'
            }`}>
            <div class="mb-8 flex items-center justify-center">
                <Show
                    when={session()?.user?.image}
                    fallback={
                        <div class="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-bg-primary font-bold text-xl">
                            {session()?.user?.name?.[0]?.toUpperCase() || "T/A"}
                        </div>
                    }
                >
                    <img
                        src={session()!.user!.image!}
                        alt="Profile"
                        class="w-12 h-12 rounded-full border-2 border-accent"
                    />
                </Show>
            </div>

            <nav class="flex-1 w-full flex flex-col gap-2">
                <For each={NAVIGATION_PANELS.filter(p => p.id !== 'settings')}>
                    {(panel) => (
                        <SidebarItem
                            id={panel.id}
                            label={panel.label}
                            icon={panel.icon || ""}
                        />
                    )}
                </For>
            </nav>

            <div class="mt-auto w-full px-4 pb-4">
                <button
                    onClick={() => panelState.setSidebarPosition(panelState.sidebarPosition() === 'left' ? 'right' : 'left')}
                    class="w-full p-2 rounded-lg hover:bg-surface transition-colors text-text-faint hover:text-text-main"
                    title="Toggle Sidebar Position"
                >
                    {panelState.sidebarPosition() === 'left' ? '»' : '«'}
                </button>
            </div>

            {/* Settings at the very bottom */}
            <div class="w-full border-t border-border">
                <For each={NAVIGATION_PANELS.filter(p => p.id === 'settings')}>
                    {(panel) => (
                        <SidebarItem
                            id={panel.id}
                            label={panel.label}
                            icon={panel.icon || ""}
                        />
                    )}
                </For>
            </div>
        </aside>
    );
};
