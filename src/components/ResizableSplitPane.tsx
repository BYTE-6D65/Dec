import { Component, createSignal, JSX, onCleanup } from "solid-js";

interface ResizableSplitPaneProps {
    left: JSX.Element;
    right: JSX.Element;
    initialLeftWidth?: number; // in pixels or percentage (if we want to get fancy, but pixels is easier for now)
    minLeftWidth?: number;
    maxLeftWidth?: number;
}

export const ResizableSplitPane: Component<ResizableSplitPaneProps> = (props) => {
    const [leftWidth, setLeftWidth] = createSignal(props.initialLeftWidth || 300);
    const [isDragging, setIsDragging] = createSignal(false);

    const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging()) return;

        // Calculate new width based on mouse position
        // We assume the sidebar is on the left edge of the container/screen for simplicity in this context,
        // but for a more robust component we might need ref to the container.
        // However, since this is a full-height panel usually, e.clientX is a good approximation if the panel starts at left.
        // But wait, the panel might be inside a layout. 
        // Let's rely on movementX for delta or just use clientX relative to the container if possible.
        // Actually, simpler: just update width based on movement.

        // Better approach:
        // We can't easily get container offset without a ref. 
        // Let's use a ref for the container.

        // For now, let's try using the delta approach which is often smoother for simple splitters.
        // setLeftWidth(w => w + e.movementX);

        // But movementX can be jittery. 
        // Let's stick to absolute position if we can. 
        // If we assume the handle is at `leftWidth`, then `e.clientX` change applies directly.

        let newWidth = leftWidth() + e.movementX;

        // Constraints
        const min = props.minLeftWidth || 150;
        const max = props.maxLeftWidth || 600;

        if (newWidth < min) newWidth = min;
        if (newWidth > max) newWidth = max;

        setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
    };

    onCleanup(() => {
        if (typeof document !== "undefined") {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        }
    });

    return (
        <div class="flex h-full w-full overflow-hidden">
            <div style={{ width: `${leftWidth()}px` }} class="flex-shrink-0 h-full overflow-hidden relative">
                {props.left}
            </div>

            {/* Handle */}
            <div
                class="w-1 hover:w-2 bg-border hover:bg-accent cursor-col-resize flex-shrink-0 transition-all z-10 flex items-center justify-center group relative -ml-0.5"
                onMouseDown={handleMouseDown}
            >
                {/* Visual handle indicator */}
                <div class="w-0.5 h-8 bg-text-muted group-hover:bg-text-main rounded-full transition-colors" />
            </div>

            <div class="flex-1 h-full overflow-hidden min-w-0">
                {props.right}
            </div>
        </div>
    );
};
