import { createSignal, createEffect, createContext, useContext, Component, JSX } from "solid-js";

// --- Types ---

export type Theme = "cyan" | "purple" | "orange" | "white" | "dark" | "system";

export interface VisitorConfig {
    theme: Theme;
    sidebarExpanded: boolean;
    panelSizes: Record<string, number>;
    defaultWorkspace: string;
}

export interface SessionConfig {
    activeWorkspace: string | null;
}

export interface UserConfig extends VisitorConfig {
    // User config extends visitor config as it overrides it
}

export interface FinalConfig extends VisitorConfig {
    activeWorkspace: string | null;
}

// --- Constants ---

const VISITOR_KEY = "dec_visitor_config_v1";
const SESSION_KEY = "dec_session_config_v1";

const defaultVisitorConfig: VisitorConfig = {
    theme: "system",
    sidebarExpanded: true,
    panelSizes: {},
    defaultWorkspace: "dashboard"
};

const defaultSessionConfig: SessionConfig = {
    activeWorkspace: null
};

// --- Stores ---

// Visitor Store
const [visitorConfig, setVisitorConfig] = createSignal<VisitorConfig>(defaultVisitorConfig);

// Session Store
const [sessionConfig, setSessionConfig] = createSignal<SessionConfig>(defaultSessionConfig);

// User Store
const [userConfig, setUserConfig] = createSignal<UserConfig | null>(null);

// --- Initialization ---

const init = () => {
    if (typeof window !== "undefined") {
        // Init Visitor
        const storedVisitor = localStorage.getItem(VISITOR_KEY);
        if (storedVisitor) {
            try {
                setVisitorConfig({ ...defaultVisitorConfig, ...JSON.parse(storedVisitor) });
            } catch (e) {
                console.error("Failed to parse visitor config", e);
            }
        } else {
            localStorage.setItem(VISITOR_KEY, JSON.stringify(defaultVisitorConfig));
        }

        // Init Session
        const storedSession = sessionStorage.getItem(SESSION_KEY);
        if (storedSession) {
            try {
                setSessionConfig({ ...defaultSessionConfig, ...JSON.parse(storedSession) });
            } catch (e) {
                console.error("Failed to parse session config", e);
            }
        } else {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(defaultSessionConfig));
        }
    }
};

// Auto-init if client-side immediately (optional, but good for non-SSR)
if (typeof window !== "undefined") {
    init();
}

// --- Persistence Effects ---

createEffect(() => {
    if (typeof window !== "undefined") {
        localStorage.setItem(VISITOR_KEY, JSON.stringify(visitorConfig()));
    }
});

createEffect(() => {
    if (typeof window !== "undefined") {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionConfig()));
    }
});

// --- Merging Logic ---

const finalConfig = () => {
    const v = visitorConfig();
    const s = sessionConfig();
    const u = userConfig();

    // Merge: User > Visitor
    const base = u ? { ...v, ...u } : v;

    // Session overrides ephemeral
    return {
        ...base,
        activeWorkspace: s.activeWorkspace || base.defaultWorkspace
    };
};

// --- Context ---

const ConfigContext = createContext();

export const ConfigProvider: Component<{ children: JSX.Element }> = (props) => {
    // Theme Effect
    createEffect(() => {
        const config = finalConfig();
        const root = document.documentElement;

        // Remove existing theme classes
        root.classList.remove("theme-cyan", "theme-purple", "theme-orange", "theme-white", "theme-dark");

        // Handle system theme
        let theme = config.theme;
        if (theme === "system") {
            theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "white";
        }

        root.classList.add(`theme-${theme}`);
    });

    const updateVisitor = (fn: (prev: VisitorConfig) => VisitorConfig) => {
        const newConfig = fn(visitorConfig());
        setVisitorConfig(newConfig);

        // Auto-save theme to API if user is signed in
        if (typeof window !== "undefined") {
            fetch("/api/auth/session")
                .then(res => res.json())
                .then(data => {
                    if (data?.user) {
                        savePreferencesToAPI({ theme: newConfig.theme });
                    }
                })
                .catch(err => console.error("Failed to check session:", err));
        }
    };

    const updateSession = (fn: (prev: SessionConfig) => SessionConfig) => {
        setSessionConfig(fn(sessionConfig()));
    };

    const setUser = (config: UserConfig | null) => {
        setUserConfig(config);
    };

    return (
        <ConfigContext.Provider value={{
            config: finalConfig,
            updateVisitor,
            updateSession,
            setUser
        }}>
            {props.children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) throw new Error("useConfig must be used within ConfigProvider");
    return context as {
        config: () => FinalConfig;
        updateVisitor: (fn: (prev: VisitorConfig) => VisitorConfig) => void;
        updateSession: (fn: (prev: SessionConfig) => SessionConfig) => void;
        setUser: (config: UserConfig | null) => void;
    };
};

// Export stores for direct access if needed (though context is preferred)
export const VisitorConfigStore = { state: visitorConfig, set: setVisitorConfig };
export const SessionConfigStore = { state: sessionConfig, set: setSessionConfig };
export const UserConfigStore = { state: userConfig, set: setUserConfig };
export const useFinalConfig = finalConfig;
export const initConfig = init;

// --- API Sync Functions ---

let saveTimeout: NodeJS.Timeout | null = null;

export const loadPreferencesFromAPI = async () => {
    try {
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
            const data = await response.json();
            if (data.preferences?.theme) {
                setVisitorConfig(prev => ({ ...prev, theme: data.preferences.theme }));
            }
            return data.preferences;
        }
    } catch (error) {
        console.error('Failed to load preferences from API:', error);
    }
    return null;
};

export const savePreferencesToAPI = async (preferences: { theme?: Theme }) => {
    // Debounce saves
    if (saveTimeout) clearTimeout(saveTimeout);

    saveTimeout = setTimeout(async () => {
        try {
            const response = await fetch('/api/user/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferences }),
            });
            if (!response.ok) {
                console.error('Failed to save preferences to API');
            }
        } catch (error) {
            console.error('Failed to save preferences to API:', error);
        }
    }, 1000); // Debounce by 1 second
};

