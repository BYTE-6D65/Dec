import { createSignal } from "solid-js";

export interface SessionState {
    id: string;
    lastActivePanel: string | null;
}

const STORAGE_KEY = "dec_session_v1";

const defaultState: SessionState = {
    id: crypto.randomUUID(),
    lastActivePanel: null
};

function getInitialState(): SessionState {
    if (typeof window === "undefined") return defaultState;

    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return { ...defaultState, ...JSON.parse(stored) };
        } catch (e) {
            console.error("Failed to parse session state", e);
        }
    }

    const newState = { ...defaultState, id: crypto.randomUUID() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    return newState;
}

const [sessionState, setSessionState] = createSignal<SessionState>(defaultState);

// Initialize on client
if (typeof window !== "undefined") {
    setSessionState(getInitialState());
}

export const useSession = () => {
    const update = (fn: (state: SessionState) => SessionState) => {
        const newState = fn(sessionState());
        setSessionState(newState);
        if (typeof window !== "undefined") {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        }
    };

    const setLastActivePanel = (panelId: string) => {
        update(s => ({ ...s, lastActivePanel: panelId }));
    };

    return {
        state: sessionState,
        setLastActivePanel
    };
};
