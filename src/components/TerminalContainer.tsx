import { createSignal, For, Show, createResource } from "solid-js";
import { Terminal } from "./Terminal";

interface Machine {
    id: string;
    name: string;
    address: string;
}

async function fetchSession() {
    try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

export function TerminalContainer() {
    const [session] = createResource(fetchSession);
    const [machines, setMachines] = createSignal<Machine[]>([
        { id: "local", name: "Localhost", address: "localhost:9090" }
    ]);
    const [activeId, setActiveId] = createSignal("local");

    const isAuthenticated = () => session()?.user;

    const addMachine = () => {
        const id = `machine-${Date.now()}`;
        setMachines([...machines(), { id, name: `Machine ${machines().length + 1}`, address: "localhost:9090" }]);
        setActiveId(id);
    };

    return (
        <div class="flex flex-col h-full w-full bg-background text-text-main">
            <Show when={isAuthenticated()} fallback={
                <div class="flex items-center justify-center h-full">
                    <div class="text-center max-w-md px-8">
                        {/* Animated CSS Lock */}
                        <div class="flex justify-center mb-8">
                            <div class="lock-container">
                                <div class="lock-shackle"></div>
                                <div class="lock-body"></div>
                                <div class="lock-keyhole"></div>
                            </div>
                        </div>
                        <h2 class="text-2xl font-bold mb-4 text-text-main">Authentication Required</h2>
                        <p class="text-text-muted mb-6">
                            The terminal is currently only available to authenticated users.
                            Please sign in to access this feature.
                        </p>
                        <p class="text-sm text-text-faint">
                            Terminal access will be expanded in future updates with proper
                            sandboxing and security controls.
                        </p>
                    </div>
                </div>
            }>
                <div class="flex items-center bg-surface border-b border-border">
                    <For each={machines()}>
                        {(machine) => (
                            <button
                                class={`px-4 py-2 text-sm ${activeId() === machine.id
                                    ? "bg-background text-text-main border-t-2 border-accent"
                                    : "text-text-muted hover:bg-surface-highlight"
                                    }`}
                                onClick={() => setActiveId(machine.id)}
                            >
                                {machine.name}
                            </button>
                        )}
                    </For>
                    <button
                        onClick={addMachine}
                        class="px-3 py-2 text-text-muted hover:text-text-main hover:bg-surface-highlight"
                    >
                        +
                    </button>
                </div>
                <div class="flex-1 relative overflow-hidden">
                    <For each={machines()}>
                        {(machine) => (
                            <div
                                class={`absolute inset-0 ${activeId() === machine.id ? "block" : "hidden"
                                    }`}
                            >
                                <Terminal machineId={machine.name} address={machine.address} />
                            </div>
                        )}
                    </For>
                </div>
            </Show>
        </div>
    );
}
