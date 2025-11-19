import { Component, createSignal, Show } from "solid-js";

export const ProjectsPanel: Component = () => {
    const [serverUrl, setServerUrl] = createSignal("https://vscode.dev");
    const [isConnected, setIsConnected] = createSignal(false);

    const handleConnect = (e: Event) => {
        e.preventDefault();
        setIsConnected(true);
    };

    return (
        <div class="h-full flex flex-col">
            <Show when={!isConnected()} fallback={
                <div class="flex-1 bg-surface rounded-lg overflow-hidden border border-border">
                    <iframe
                        src={serverUrl()}
                        class="w-full h-full border-none"
                        title="Code Server"
                        allow="clipboard-read; clipboard-write"
                    />
                    <div class="h-8 bg-background border-t border-border flex items-center px-4 justify-between">
                        <span class="text-xs text-text-muted font-mono">Connected to: {serverUrl()}</span>
                        <button onClick={() => setIsConnected(false)} class="text-xs text-error hover:opacity-80">Disconnect</button>
                    </div>
                </div>
            }>
                <div class="flex-1 flex flex-col items-center justify-center bg-surface rounded-lg border border-border border-dashed">
                    <div class="max-w-md w-full p-8 bg-surface-highlight rounded-lg shadow-xl">
                        <h2 class="text-2xl font-bold mb-2 text-center">Connect to Workspace</h2>
                        <p class="text-text-muted text-sm mb-6 text-center">Enter the URL of your Code Server or VS Code Web instance.</p>

                        <form onSubmit={handleConnect} class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-text-faint uppercase mb-1">Server URL</label>
                                <input
                                    type="url"
                                    value={serverUrl()}
                                    onInput={(e) => setServerUrl(e.currentTarget.value)}
                                    class="w-full bg-background border border-border rounded p-3 text-text-main outline-none focus:border-accent transition-colors font-mono text-sm"
                                    placeholder="https://..."
                                />
                            </div>
                            <button type="submit" class="w-full bg-accent text-background font-bold py-3 rounded hover:bg-text-main transition-colors">
                                Launch Environment
                            </button>
                        </form>
                    </div>
                </div>
            </Show>
        </div>
    );
};
