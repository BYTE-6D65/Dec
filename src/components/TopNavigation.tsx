import { Component, For } from "solid-js";
import { panelState } from "../state/panelState";
import { useConfig } from "~/state/configStore";
import { UserProfile } from "~/components/UserProfile";
import { NAVIGATION_PANELS } from "~/config/navigation";

export const TopNavigation: Component = () => {
    const { config, updateVisitor } = useConfig();
    return (
        <nav class="h-12 bg-background border-b border-border flex items-center justify-between px-6 select-none shrink-0">
            <div class="flex items-center gap-2 text-sm font-mono overflow-x-auto no-scrollbar whitespace-nowrap">
                <span class="text-accent font-bold">~/</span>
                <For each={NAVIGATION_PANELS}>
                    {(panel, index) => (
                        <>
                            <button
                                onClick={() => panelState.setActivePanel(panel.id)}
                                class={`hover:text-text-main transition-colors ${panelState.activePanel() === panel.id
                                    ? "text-text-main font-bold"
                                    : "text-text-muted"
                                    }`}
                            >
                                {panel.label}
                            </button>
                            {index() < NAVIGATION_PANELS.length - 1 && (
                                <span class="text-border-strong">/</span>
                            )}
                        </>
                    )}
                </For>
            </div>

            <div class="flex items-center gap-4">
                <UserProfile />
                <button
                    onClick={() => {
                        const themes: ('cyan' | 'purple' | 'orange' | 'white' | 'system')[] = ['cyan', 'purple', 'orange', 'white', 'system'];
                        const current = config().theme;
                        // Filter out 'dark' if it's not in our cycle list, or just handle it
                        const currentIndex = themes.indexOf(current as any);
                        const next = themes[(currentIndex + 1) % themes.length];
                        updateVisitor(prev => ({ ...prev, theme: next }));
                    }}
                    class="px-4 py-2 rounded border border-accent bg-bg-secondary text-text-primary hover:bg-accent hover:text-bg-primary transition-colors font-mono uppercase"
                    title={`Current theme: ${config().theme}`}
                >
                    {config().theme}
                </button>
            </div>
        </nav>
    );
};
