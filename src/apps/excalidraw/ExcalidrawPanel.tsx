import { Component, createEffect, onCleanup, onMount } from "solid-js";
import { useConfig } from "../../state/configStore";

export const ExcalidrawPanel: Component = () => {
    const REACT_SERVICE_URL = "http://localhost:5174/excalidraw";
    const { config } = useConfig();
    let iframeRef: HTMLIFrameElement | undefined;

    const sendThemeToIframe = () => {
        if (!iframeRef?.contentWindow) return;

        // Check which theme class is actually applied to the document
        const root = document.documentElement;
        // Purple, orange, cyan, and dark are all dark themes
        // Only 'white' is light mode
        const isDark = !root.classList.contains('theme-white');

        console.log('[ExcalidrawPanel] Sending theme:', isDark ? 'dark' : 'light', 'classList:', root.className);

        iframeRef.contentWindow.postMessage({
            type: 'THEME_CHANGE',
            theme: isDark ? 'dark' : 'light',
        }, '*');
    };

    // Send theme whenever config changes
    createEffect(() => {
        config().theme; // track theme changes
        // Small delay to ensure DOM has updated
        setTimeout(sendThemeToIframe, 100);
    });

    // Send initial theme when iframe loads
    const handleIframeLoad = () => {
        console.log('[ExcalidrawPanel] Iframe loaded');
        sendThemeToIframe();
    };

    // Listen for theme requests from iframe
    onMount(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'REQUEST_THEME') {
                console.log('[ExcalidrawPanel] Received REQUEST_THEME');
                sendThemeToIframe();
            }
        };
        window.addEventListener('message', handleMessage);
        onCleanup(() => window.removeEventListener('message', handleMessage));
    });

    return (
        <div class="w-full h-full bg-background">
            <iframe
                ref={iframeRef}
                src={REACT_SERVICE_URL}
                class="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; clipboard-read"
                allowfullscreen
                title="Excalidraw"
                onLoad={handleIframeLoad}
            />
        </div>
    );
};
