import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type KeyboardEvent as ReactKeyboardEvent,
    type PointerEvent as ReactPointerEvent,
} from 'react';
import { useObjectUrl } from '../useObjectUrl';
import { objectContainBox, type ContainBox } from './object-contain-box';

type ImageDisplayCompareSliderProps = {
    before: Blob;
    after: Blob | null;
    afterLoading?: boolean;
    alt: string;
    beforeLabel?: string;
    afterLabel?: string;
};

export function clampSplit(value: number): number {
    return Math.min(92, Math.max(8, value));
}

/** Wipe between original (left) and processed (right). One of several stage displays. */
export function ImageDisplayCompareSlider({
    before,
    after,
    afterLoading = false,
    alt,
    beforeLabel = 'Original',
    afterLabel = 'Neu',
}: ImageDisplayCompareSliderProps) {
    const beforeUrl = useObjectUrl(before);
    const afterUrl = useObjectUrl(after);
    const frameRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLImageElement>(null);
    const [split, setSplit] = useState(50);
    const [box, setBox] = useState<ContainBox>({ x: 0, y: 0, w: 0, h: 0 });

    const measure = useCallback(() => {
        const img = measureRef.current;
        if (!img) return;
        setBox(objectContainBox(img.naturalWidth, img.naturalHeight, img.clientWidth, img.clientHeight));
    }, []);

    useEffect(() => {
        measure();
        const img = measureRef.current;
        const frame = frameRef.current;
        if (!img || typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(() => measure());
        observer.observe(img);
        if (frame) observer.observe(frame);
        return () => observer.disconnect();
    }, [measure, beforeUrl]);

    const setFromClientX = useCallback(
        (clientX: number) => {
            const frame = frameRef.current;
            if (!frame || box.w <= 0) return;
            const rect = frame.getBoundingClientRect();
            const localX = clientX - rect.left - box.x;
            setSplit(clampSplit((localX / box.w) * 100));
        },
        [box.w, box.x],
    );

    function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
        event.currentTarget.setPointerCapture(event.pointerId);
        setFromClientX(event.clientX);
    }

    function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        setFromClientX(event.clientX);
    }

    function onHandleKey(event: ReactKeyboardEvent<HTMLButtonElement>) {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            setSplit((value) => clampSplit(value - 4));
        }
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            setSplit((value) => clampSplit(value + 4));
        }
    }

    if (!beforeUrl) return null;

    const ready = box.w > 1 && box.h > 1;

    return (
        <div ref={frameRef} className="absolute inset-0 select-none p-4 md:p-5">
            <div className="relative h-full w-full">
                <img
                    ref={measureRef}
                    src={beforeUrl}
                    alt=""
                    className="pointer-events-none h-full w-full object-contain opacity-0"
                    draggable={false}
                    onLoad={measure}
                />

                {ready ? (
                    <div
                        className="absolute overflow-hidden"
                        style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
                    >
                        {afterLoading || !afterUrl ? (
                            <div
                                className="ms-compare-load absolute inset-0"
                                aria-live="polite"
                                aria-busy="true"
                            >
                                <span className="sr-only">Komprimiertes Bild wird berechnet</span>
                            </div>
                        ) : (
                            <img
                                src={afterUrl}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                                draggable={false}
                            />
                        )}

                        <div
                            className="absolute inset-0 overflow-hidden"
                            style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
                        >
                            <img
                                src={beforeUrl}
                                alt={alt}
                                className="absolute inset-0 h-full w-full object-cover"
                                draggable={false}
                            />
                        </div>

                        <div
                            className="absolute inset-y-0 z-10 w-8 -translate-x-1/2 cursor-ew-resize touch-none"
                            style={{ left: `${split}%` }}
                            onPointerDown={onPointerDown}
                            onPointerMove={onPointerMove}
                        >
                            <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-black" />
                            <button
                                type="button"
                                className="ms-focus absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-black bg-white shadow-[2px_2px_0_#000]"
                                aria-label="Vergleich Original und Ergebnis"
                                role="slider"
                                aria-valuemin={8}
                                aria-valuemax={92}
                                aria-valuenow={Math.round(split)}
                                onKeyDown={onHandleKey}
                            >
                                <span className="font-display text-[10px] font-bold" aria-hidden>
                                    ⟷
                                </span>
                            </button>
                        </div>

                        <span className="pointer-events-none absolute bottom-2 left-2 rounded-[4px] border-2 border-black bg-white px-1.5 py-0.5 font-display text-[10px] font-bold">
                            {beforeLabel}
                        </span>
                        <span className="pointer-events-none absolute right-2 bottom-2 rounded-[4px] border-2 border-black bg-white px-1.5 py-0.5 font-display text-[10px] font-bold">
                            {afterLoading ? '…' : afterLabel}
                        </span>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
