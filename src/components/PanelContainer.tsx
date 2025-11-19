import { Component, JSX, Show } from "solid-js";
import { panelState, PanelId } from "../state/panelState";

interface PanelContainerProps {
    id: PanelId;
    title: string;
    children: JSX.Element;
    noPadding?: boolean;
}

export const PanelContainer: Component<PanelContainerProps> = (props) => {
    const isActive = () => panelState.activePanel() === props.id;

    return (
        <div
            class={`flex-col h-full w-full ${isActive() ? "flex" : "hidden"}`}
        >
            {/* Content Area - Only visible/scrollable when active */}
            <div class="flex-1 overflow-hidden bg-background relative flex flex-col">
                <div class={`flex-1 overflow-auto w-full ${props.noPadding ? "" : "p-8 mx-auto max-w-[1600px]"}`}>
                    {props.children}
                </div>
            </div>
        </div>
    );
};
