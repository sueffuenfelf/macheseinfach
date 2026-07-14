import { useCallback, useEffect, useRef } from 'react';

const EDGE_PX = 72;
const MAX_SPEED = 3.5;

function speedForDistance(distance: number): number {
    const ratio = Math.max(0, Math.min(1, 1 - distance / EDGE_PX));
    return ratio * MAX_SPEED;
}

export function useDragAutoScroll() {
    const draggingRef = useRef(false);
    const pointerYRef = useRef(0);
    const frameRef = useRef<number | null>(null);

    const stopLoop = useCallback(() => {
        if (frameRef.current !== null) {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
        }
    }, []);

    const loop = useCallback(() => {
        if (!draggingRef.current) {
            stopLoop();
            return;
        }
        const y = pointerYRef.current;
        const viewportHeight = window.innerHeight;
        if (y < EDGE_PX) {
            window.scrollBy({ top: -speedForDistance(y), behavior: 'auto' });
        } else if (y > viewportHeight - EDGE_PX) {
            window.scrollBy({ top: speedForDistance(viewportHeight - y), behavior: 'auto' });
        }
        frameRef.current = requestAnimationFrame(loop);
    }, [stopLoop]);

    const beginDragAutoScroll = useCallback(() => {
        draggingRef.current = true;
        if (frameRef.current === null) {
            frameRef.current = requestAnimationFrame(loop);
        }
    }, [loop]);

    const endDragAutoScroll = useCallback(() => {
        draggingRef.current = false;
        stopLoop();
    }, [stopLoop]);

    const trackDragPointer = useCallback((clientY: number) => {
        pointerYRef.current = clientY;
    }, []);

    useEffect(() => () => stopLoop(), [stopLoop]);

    return {
        beginDragAutoScroll,
        endDragAutoScroll,
        trackDragPointer,
    };
}
