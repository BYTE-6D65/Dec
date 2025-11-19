import { onMount, onCleanup } from "solid-js";
import { Terminal as Xterm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { getAuthToken } from "~/utils/auth";

interface TerminalProps {
    machineId?: string;
    address?: string;
}

export function Terminal(props: TerminalProps) {
    let terminalContainer: HTMLDivElement | undefined;
    let terminal: Xterm | undefined;
    let fitAddon: FitAddon | undefined;
    let socket: WebSocket | undefined;

    onMount(() => {
        if (!terminalContainer) return;

        terminal = new Xterm({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            allowTransparency: true,
            theme: {
                background: "transparent",
            },
        });

        fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);

        terminal.open(terminalContainer);

        // Small delay to ensure container has size
        setTimeout(() => {
            fitAddon?.fit();
        }, 0);

        terminal.write("Welcome to DEC Terminal\r\n");
        terminal.write(`Connecting to ${props.machineId || "local"}...\r\n`);

        // Mock connection logic
        const connect = async () => {
            try {
                const token = await getAuthToken();

                // Placeholder URL - in production this would be dynamic based on props.address
                const wsUrl = props.address
                    ? `wss://${props.address}/cockpit/socket?token=${token}`
                    : `wss://localhost:9090/cockpit/socket?token=${token}`;

                terminal?.write(`Connecting to ${wsUrl}...\r\n`);

                socket = new WebSocket(wsUrl);

                socket.onopen = () => {
                    terminal?.write("\r\nConnected to Cockpit PTY.\r\n");
                    // Cockpit specific init protocol could go here
                };

                socket.onmessage = (event) => {
                    if (typeof event.data === 'string') {
                        terminal?.write(event.data);
                    } else {
                        const reader = new FileReader();
                        reader.onload = () => {
                            terminal?.write(reader.result as string);
                        };
                        reader.readAsText(event.data);
                    }
                };

                terminal?.onData((data) => {
                    if (socket?.readyState === WebSocket.OPEN) {
                        socket.send(data);
                    }
                });

                socket.onclose = () => {
                    terminal?.write("\r\nConnection closed.\r\n");
                };

                socket.onerror = (e) => {
                    // Don't show full error object as it's usually empty in JS
                    terminal?.write(`\r\nConnection error. Check console.\r\n`);
                    console.error("WebSocket error:", e);
                };

            } catch (err) {
                terminal?.write(`\r\nFailed to connect: ${err}\r\n`);
            }
        };

        connect();

        const resizeObserver = new ResizeObserver(() => {
            fitAddon?.fit();
        });
        resizeObserver.observe(terminalContainer);

        onCleanup(() => {
            resizeObserver.disconnect();
            terminal?.dispose();
            if (socket) {
                socket.close();
            }
        });
    });

    return <div ref={terminalContainer} class="w-full h-full bg-background" />;
}
