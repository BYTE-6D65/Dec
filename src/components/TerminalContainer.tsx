import { createSignal, For } from "solid-js";
import { Terminal } from "./Terminal";

interface Machine {
    id: string;
    name: string;
    address: string;
}

export function TerminalContainer() {
    const [machines, setMachines] = createSignal<Machine[]>([
        { id: "local", name: "Localhost", address: "localhost:9090" }
    ]);
    const [activeId, setActiveId] = createSignal("local");

    const addMachine = () => {
        const id = `machine-${Date.now()}`;
        setMachines([...machines(), { id, name: `Machine ${machines().length + 1}`, address: "localhost:9090" }]);
        setActiveId(id);
    };

    return (
        <div class="flex flex-col h-full w-full bg-background text-text-main">
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
        </div>
    );
}
