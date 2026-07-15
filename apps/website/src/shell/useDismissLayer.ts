import { useEffect, useRef } from 'react';

type DismissEntry = {
    dismiss: () => void;
};

const stack: DismissEntry[] = [];
let listening = false;

function handleEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;
    const top = stack.at(-1);
    if (!top) return;
    event.preventDefault();
    event.stopPropagation();
    top.dismiss();
}

function ensureListening() {
    if (listening) return;
    listening = true;
    window.addEventListener('keydown', handleEscape, true);
}

/**
 * Registers an overlay in a global LIFO stack so [Escape] always dismisses
 * the topmost open layer (nested dialogs, popovers, palettes).
 */
export function useDismissLayer(active: boolean, onDismiss: () => void): void {
    const onDismissRef = useRef(onDismiss);
    onDismissRef.current = onDismiss;

    useEffect(() => {
        if (!active) return;
        ensureListening();
        const entry: DismissEntry = {
            dismiss: () => onDismissRef.current(),
        };
        stack.push(entry);
        return () => {
            const index = stack.indexOf(entry);
            if (index >= 0) stack.splice(index, 1);
        };
    }, [active]);
}
