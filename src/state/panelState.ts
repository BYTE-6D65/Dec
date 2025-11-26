import { createSignal } from "solid-js";

export type PanelId = "about" | "blog" | "edit" | "media" | "contact" | "terminal" | "projects" | "excalidraw" | "settings";

const STORAGE_KEY = "dec_panel_state_v1";

interface PanelStateStorage {
    activePanel: PanelId | null;
    sidebarPosition: 'left' | 'right';
}

const [activePanel, setActivePanelSignal] = createSignal<PanelId | null>("about");
const [sidebarPosition, setSidebarPositionSignal] = createSignal<'left' | 'right'>('left');

const setActivePanel = (panel: PanelId | null) => {
    setActivePanelSignal(panel);
    if (typeof window !== "undefined") {
        const current = loadState();
        saveState({ ...current, activePanel: panel });

        // Auto-save to API if user is signed in
        fetch("/api/auth/session")
            .then(res => res.json())
            .then(data => {
                if (data?.user) {
                    savePanelPreferencesToAPI({ activePanel: panel });
                }
            })
            .catch(err => console.error("Failed to check session:", err));
    }
};

const setSidebarPosition = (position: 'left' | 'right') => {
    setSidebarPositionSignal(position);
    if (typeof window !== "undefined") {
        const current = loadState();
        saveState({ ...current, sidebarPosition: position });

        // Auto-save to API if user is signed in
        fetch("/api/auth/session")
            .then(res => res.json())
            .then(data => {
                if (data?.user) {
                    savePanelPreferencesToAPI({ sidebarPosition: position });
                }
            })
            .catch(err => console.error("Failed to check session:", err));
    }
};

const loadState = (): PanelStateStorage => {
    if (typeof window === "undefined") {
        return { activePanel: "about", sidebarPosition: 'left' };
    }
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Failed to parse panel state", e);
    }
    return { activePanel: "about", sidebarPosition: 'left' };
};

const saveState = (state: PanelStateStorage) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
};

const init = () => {
    if (typeof window !== "undefined") {
        const state = loadState();
        setActivePanelSignal(state.activePanel);
        setSidebarPositionSignal(state.sidebarPosition);
    }
};

export const panelState = {
    activePanel,
    setActivePanel,
    sidebarPosition,
    setSidebarPosition,
    togglePanel: (panel: PanelId) => {
        const current = activePanel();
        setActivePanel(current === panel ? null : panel);
    },
    init,
};

// --- API Sync Functions ---

let savePanelTimeout: NodeJS.Timeout | null = null;

export const loadPanelPreferencesFromAPI = async () => {
    try {
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
            const data = await response.json();
            if (data.preferences?.sidebarPosition) {
                setSidebarPositionSignal(data.preferences.sidebarPosition);
            }
            if (data.preferences?.activePanel !== undefined) {
                setActivePanelSignal(data.preferences.activePanel);
            }
            return data.preferences;
        }
    } catch (error) {
        console.error('Failed to load panel preferences from API:', error);
    }
    return null;
};

export const savePanelPreferencesToAPI = async (preferences: { sidebarPosition?: 'left' | 'right'; activePanel?: PanelId | null }) => {
    // Debounce saves
    if (savePanelTimeout) clearTimeout(savePanelTimeout);

    savePanelTimeout = setTimeout(async () => {
        try {
            const response = await fetch('/api/user/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferences }),
            });
            if (!response.ok) {
                console.error('Failed to save panel preferences to API');
            }
        } catch (error) {
            console.error('Failed to save panel preferences to API:', error);
        }
    }, 1000); // Debounce by 1 second
};


