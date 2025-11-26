import { PanelId } from "~/state/panelState";

export interface PanelConfig {
    id: PanelId;
    label: string;
    icon?: string; // Icon for sidebar
}

export const NAVIGATION_PANELS: PanelConfig[] = [
    { id: 'about', label: 'About', icon: 'user' },
    { id: 'blog', label: 'Blog', icon: 'book' },
    { id: 'edit', label: 'Edit', icon: 'edit' },
    { id: 'excalidraw', label: 'Excalidraw', icon: 'draw' },
    { id: 'media', label: 'Media', icon: 'play' },
    { id: 'contact', label: 'Contact', icon: 'mail' },
    { id: 'terminal', label: 'Terminal', icon: 'term' },
    { id: 'projects', label: 'Projects', icon: 'code' },
    { id: 'settings', label: 'Settings', icon: 'gear' },
];
