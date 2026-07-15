import { useCallback, useEffect, useState, type RefObject } from 'react';

export function useFullscreenTarget(targetRef: RefObject<HTMLElement | null>) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        function syncFullscreenState() {
            setIsFullscreen(document.fullscreenElement === targetRef.current);
        }
        document.addEventListener('fullscreenchange', syncFullscreenState);
        syncFullscreenState();
        return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
    }, [targetRef]);

    const toggleFullscreen = useCallback(async () => {
        const target = targetRef.current;
        if (!target) return;

        try {
            if (document.fullscreenElement === target) {
                await document.exitFullscreen();
                return;
            }
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
            await target.requestFullscreen();
        } catch {
            /* User gesture required or API unavailable */
        }
    }, [targetRef]);

    const exitFullscreen = useCallback(async () => {
        if (document.fullscreenElement === targetRef.current) {
            await document.exitFullscreen();
        }
    }, [targetRef]);

    return { isFullscreen, toggleFullscreen, exitFullscreen };
}
