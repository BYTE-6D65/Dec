import { Component, JSX, Show } from "solid-js";
import { TopNavigation } from "./TopNavigation";
import { Sidebar } from "./Sidebar";
import { panelState } from "~/state/panelState";

interface LayoutProps {
    children: JSX.Element;
}

export const Layout: Component<LayoutProps> = (props) => {
    return (
        <div class="flex h-screen w-screen bg-background text-text-main overflow-hidden">
            <Show when={panelState.sidebarPosition() === 'left'}>
                <Sidebar />
            </Show>

            <div class="flex-1 flex flex-col h-full relative overflow-hidden">
                <TopNavigation />
                <main class="flex-1 flex flex-col h-full relative overflow-hidden">
                    {props.children}
                </main>
            </div>

            <Show when={panelState.sidebarPosition() === 'right'}>
                <Sidebar />
            </Show>
        </div>
    );
};
