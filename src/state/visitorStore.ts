import { createSignal, createEffect } from "solid-js";

export interface VisitorState {
    id: string;
    theme: 'light' | 'dark' | 'system';
    sidebarOpen: boolean;
    panelSizes: Record<string, number>;
}

const STORAGE_KEY = "dec_visitor_v1";

const defaultState: VisitorState = {
    id: crypto.randomUUID(),
    theme: 'system',
    sidebarOpen: true,
    panelSizes: {}
};

function getInitialState(): VisitorState {
    if (typeof window === "undefined") return defaultState;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return { ...defaultState, ...JSON.parse(stored) };
        } catch (e) {
            console.error("Failed to parse visitor state", e);
        }
    }

    const newState = { ...defaultState, id: crypto.randomUUID() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    return newState;
}

const [visitorState, setVisitorState] = createSignal<VisitorState>(defaultState);

// Initialize on client
if (typeof window !== "undefined") {
    setVisitorState(getInitialState());
}

export const useVisitor = () => {
    const update = (fn: (state: VisitorState) => VisitorState) => {
        const newState = fn(visitorState());
        setVisitorState(newState);
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        }
    };

    const setTheme = (theme: VisitorState['theme']) => {
        update(s => ({ ...s, theme }));
    };

    const toggleSidebar = () => {
        update(s => ({ ...s, sidebarOpen: !s.sidebarOpen }));
    };

    const setPanelSize = (panelId: string, size: number) => {
        update(s => ({ ...s, panelSizes: { ...s.panelSizes, [panelId]: size } }));
    };

    return {
        state: visitorState,
        setTheme,
        toggleSidebar,
        setPanelSize
    };
};
