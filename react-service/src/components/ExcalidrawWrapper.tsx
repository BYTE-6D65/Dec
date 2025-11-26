import React from 'react';
import { Excalidraw } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import "@excalidraw/excalidraw/index.css";

export const ExcalidrawWrapper: React.FC = () => {
    // Default to dark since parent will send correct theme immediately on load
    // (window.matchMedia doesn't work reliably in iframes)
    const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');

    const [excalidrawAPI, setExcalidrawAPI] = React.useState<ExcalidrawImperativeAPI | null>(null);

    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            console.log('[ExcalidrawWrapper] Received message:', event.data);
            if (event.data && event.data.type === 'THEME_CHANGE') {
                console.log('[ExcalidrawWrapper] Setting theme to:', event.data.theme);
                setTheme(event.data.theme);
            }
        };

        window.addEventListener('message', handleMessage);

        // Request initial theme from parent
        window.parent.postMessage({ type: 'REQUEST_THEME' }, '*');

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Force theme update via API when theme changes
    React.useEffect(() => {
        if (excalidrawAPI) {
            console.log('[ExcalidrawWrapper] Updating theme via API to:', theme);
            excalidrawAPI.updateScene({
                appState: {
                    theme: theme
                }
            });
        }
    }, [theme, excalidrawAPI]);

    console.log('[ExcalidrawWrapper] Current theme:', theme);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Excalidraw
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                theme={theme}
            />
        </div>
    );
};
