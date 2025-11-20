import { createSignal } from "solid-js";

export type PanelId = "about" | "blog" | "edit" | "media" | "contact" | "terminal" | "projects";

const [activePanel, setActivePanel] = createSignal<PanelId | null>("about");
const [sidebarPosition, setSidebarPosition] = createSignal<'left' | 'right'>('left');

export const panelState = {
    activePanel,
    setActivePanel,
    sidebarPosition,
    setSidebarPosition,
    togglePanel: (panel: PanelId) => {
        setActivePanel((current) => (current === panel ? null : panel));
    },
};
