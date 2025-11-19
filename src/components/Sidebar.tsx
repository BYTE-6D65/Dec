import { Component } from "solid-js";
import { panelState, PanelId } from "../state/panelState";

const SidebarItem: Component<{ id: PanelId; label: string; icon: string }> = (props) => {
    const isActive = () => panelState.activePanel() === props.id;

    return (
        <button
            onClick={() => panelState.setActivePanel(props.id)}
            class={`w-full p-4 flex flex-col items-center justify-center transition-colors duration-200 group ${isActive() ? "text-accent bg-surface" : "text-text-faint hover:text-text-main hover:bg-surface/50"
                }`}
            aria-label={props.label}
        >
            <span class="text-2xl mb-1">{props.icon}</span>
            <span class="text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {props.label}
            </span>
        </button>
    );
};

export const Sidebar: Component = () => {
    return (
        <aside class={`w-20 h-full bg-background flex flex-col items-center py-4 z-10 ${panelState.sidebarPosition() === 'left' ? 'border-r border-border' : 'border-l border-border'
            }`}>
            <div class="mb-8 text-accent font-bold text-xl">T/A</div>

            <nav class="flex-1 w-full flex flex-col gap-2">
                <SidebarItem id="about" label="About" icon="user" />
                <SidebarItem id="blog" label="Blog" icon="book" />
                <SidebarItem id="edit" label="Edit" icon="edit" />

                <SidebarItem id="media" label="Media" icon="play" />
                <SidebarItem id="contact" label="Contact" icon="mail" />
                <SidebarItem id="terminal" icon="term" label="Terminal" />
                <SidebarItem id="projects" label="Projects" icon="code" />
            </nav>

            <div class="mt-auto w-full px-4 pb-4">
                <button
                    onClick={() => panelState.setSidebarPosition(panelState.sidebarPosition() === 'left' ? 'right' : 'left')}
                    class="w-full p-2 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-surface/50 rounded transition-colors"
                    title="Toggle Sidebar Position"
                >
                    <span class="text-xl">
                        {panelState.sidebarPosition() === 'left' ? '»' : '«'}
                    </span>
                </button>
            </div>
        </aside>
    );
};
