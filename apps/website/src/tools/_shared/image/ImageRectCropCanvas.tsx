import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type CropRect, clampCropRect, cropNaturalSize, FULL_CROP, isFullCrop } from './crop-rect';

const STAGE_MAX = 460;
const HANDLE_HIT = 22;

type HandleId = 'nw' | 'ne' | 'sw' | 'se' | 'move';

type ImageRectCropCanvasProps = {
    file: File;
    rect: CropRect;
    onRectChange: (rect: CropRect) => void;
    /** When set, resize keeps width/height ratio. */
    aspect?: number;
    disabled?: boolean;
    title?: string;
    onNaturalSize?: (size: Natural) => void;
};

type Natural = { width: number; height: number };

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function resizeFromHandle(
    rect: CropRect,
    handle: Exclude<HandleId, 'move'>,
    point: { x: number; y: number },
    aspect?: number,
): CropRect {
    let { x, y, width, height } = rect;
    const right = x + width;
    const bottom = y + height;

    if (handle === 'se') {
        width = point.x - x;
        height = point.y - y;
    } else if (handle === 'sw') {
        width = right - point.x;
        height = point.y - y;
        x = point.x;
    } else if (handle === 'ne') {
        width = point.x - x;
        height = bottom - point.y;
        y = point.y;
    } else if (handle === 'nw') {
        width = right - point.x;
        height = bottom - point.y;
        x = point.x;
        y = point.y;
    }

    if (aspect) {
        if (handle === 'se' || handle === 'ne') {
            height = width / aspect;
            if (handle === 'ne') y = bottom - height;
        } else {
            height = width / aspect;
            if (handle === 'nw') y = bottom - height;
        }
    }

    return clampCropRect({ x, y, width, height });
}

export function ImageRectCropCanvas({
    file,
    rect,
    onRectChange,
    aspect,
    disabled = false,
    title = 'Ausschnitt wählen',
    onNaturalSize,
}: ImageRectCropCanvasProps) {
    const [src, setSrc] = useState<string | null>(null);
    const [natural, setNatural] = useState<Natural | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [activeHandle, setActiveHandle] = useState<HandleId | null>(null);
    const stageRef = useRef<HTMLDivElement | null>(null);
    const dragStart = useRef<{ rect: CropRect; point: { x: number; y: number } } | null>(null);

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setSrc(url);
        setNatural(null);
        setLoadError(false);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const stage = useMemo(() => {
        if (!natural) return null;
        const scale = Math.min(STAGE_MAX / natural.width, STAGE_MAX / natural.height, 1);
        return {
            width: Math.round(natural.width * scale),
            height: Math.round(natural.height * scale),
        };
    }, [natural]);

    const outputSize = useMemo(() => {
        if (!natural) return null;
        return cropNaturalSize(rect, natural.width, natural.height);
    }, [natural, rect]);

    const pointFromEvent = useCallback((event: { clientX: number; clientY: number }) => {
        const bounds = stageRef.current?.getBoundingClientRect();
        if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
        return {
            x: clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
            y: clamp((event.clientY - bounds.top) / bounds.height, 0, 1),
        };
    }, []);

    const onPointerDown = useCallback(
        (handle: HandleId) => (event: React.PointerEvent<HTMLButtonElement>) => {
            if (disabled) return;
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            const point = pointFromEvent(event);
            if (!point) return;
            dragStart.current = { rect, point };
            setActiveHandle(handle);
        },
        [disabled, pointFromEvent, rect],
    );

    const onPointerMove = useCallback(
        (event: React.PointerEvent) => {
            if (!activeHandle || !dragStart.current) return;
            const point = pointFromEvent(event);
            if (!point) return;
            const start = dragStart.current;

            if (activeHandle === 'move') {
                const dx = point.x - start.point.x;
                const dy = point.y - start.point.y;
                onRectChange(
                    clampCropRect({
                        x: start.rect.x + dx,
                        y: start.rect.y + dy,
                        width: start.rect.width,
                        height: start.rect.height,
                    }),
                );
                return;
            }

            onRectChange(resizeFromHandle(start.rect, activeHandle, point, aspect));
        },
        [activeHandle, aspect, onRectChange, pointFromEvent],
    );

    const endDrag = useCallback(() => {
        dragStart.current = null;
        setActiveHandle(null);
    }, []);

    if (!src) return null;

    const box = stage
        ? {
              left: rect.x * stage.width,
              top: rect.y * stage.height,
              width: rect.width * stage.width,
              height: rect.height * stage.height,
          }
        : null;

    return (
        <section
            className="space-y-3 rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm"
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-[13px] font-bold">{title}</p>
                {!isFullCrop(rect) ? (
                    <button
                        type="button"
                        className="ms-btn text-[12px]"
                        disabled={disabled}
                        onClick={() => onRectChange(FULL_CROP)}
                    >
                        Zurücksetzen
                    </button>
                ) : null}
            </div>

            {loadError ? (
                <p className="text-[13px] text-[var(--color-ink-soft)]">
                    Vorschau nicht verfügbar — Export funktioniert trotzdem.
                </p>
            ) : null}

            <div className="flex justify-center overflow-hidden rounded-[10px] bg-[var(--color-chip)] p-3">
                <div
                    ref={stageRef}
                    className="relative touch-none select-none"
                    style={
                        stage
                            ? { width: `${stage.width}px`, height: `${stage.height}px` }
                            : { width: '100%', maxWidth: `${STAGE_MAX}px`, minHeight: '160px' }
                    }
                >
                    <img
                        src={src}
                        alt={`Vorschau von ${file.name}`}
                        draggable={false}
                        className="block h-full w-full object-contain"
                        onLoad={(event) => {
                            const next = {
                                width: event.currentTarget.naturalWidth,
                                height: event.currentTarget.naturalHeight,
                            };
                            setNatural(next);
                            onNaturalSize?.(next);
                        }}
                        onError={() => setLoadError(true)}
                    />

                    {stage && box ? (
                        <>
                            <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
                                <title>Ausschnitt</title>
                                <defs>
                                    <mask id="ms-rect-crop-mask">
                                        <rect width={stage.width} height={stage.height} fill="white" />
                                        <rect
                                            x={box.left}
                                            y={box.top}
                                            width={box.width}
                                            height={box.height}
                                            fill="black"
                                        />
                                    </mask>
                                </defs>
                                <rect
                                    width={stage.width}
                                    height={stage.height}
                                    fill="rgba(0,0,0,0.45)"
                                    mask="url(#ms-rect-crop-mask)"
                                />
                                <rect
                                    x={box.left}
                                    y={box.top}
                                    width={box.width}
                                    height={box.height}
                                    fill="none"
                                    stroke="#fff"
                                    strokeWidth={3}
                                />
                                <rect
                                    x={box.left}
                                    y={box.top}
                                    width={box.width}
                                    height={box.height}
                                    fill="none"
                                    stroke="#000"
                                    strokeWidth={1.5}
                                />
                            </svg>

                            <button
                                type="button"
                                aria-label="Ausschnitt verschieben"
                                disabled={disabled}
                                className="absolute cursor-move bg-transparent"
                                style={{
                                    left: `${box.left}px`,
                                    top: `${box.top}px`,
                                    width: `${box.width}px`,
                                    height: `${box.height}px`,
                                }}
                                onPointerDown={onPointerDown('move')}
                            />

                            {(['nw', 'ne', 'sw', 'se'] as const).map((handle) => {
                                const left =
                                    handle.includes('w') ? box.left : box.left + box.width;
                                const top = handle.includes('n') ? box.top : box.top + box.height;
                                return (
                                    <button
                                        key={handle}
                                        type="button"
                                        aria-label={`Ecke ${handle}`}
                                        disabled={disabled}
                                        className="absolute rounded-full border-2 border-black bg-white shadow-brutal-sm disabled:opacity-50"
                                        style={{
                                            width: `${HANDLE_HIT}px`,
                                            height: `${HANDLE_HIT}px`,
                                            left: `${left - HANDLE_HIT / 2}px`,
                                            top: `${top - HANDLE_HIT / 2}px`,
                                            cursor: disabled ? 'not-allowed' : 'nwse-resize',
                                            touchAction: 'none',
                                        }}
                                        onPointerDown={onPointerDown(handle)}
                                    />
                                );
                            })}
                        </>
                    ) : null}
                </div>
            </div>

            {outputSize ? (
                <p className="text-[12px] text-[var(--color-ink-soft)]" aria-live="polite">
                    Ausgabe: {outputSize.width} × {outputSize.height} px
                    {aspect ? ` · Seitenverhältnis ${aspect.toFixed(3)}` : ''}
                </p>
            ) : null}
        </section>
    );
}
