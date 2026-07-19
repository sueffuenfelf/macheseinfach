import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    isConvexQuad,
    isUnitQuad,
    type Point,
    type Quad,
    quadNaturalSize,
    UNIT_QUAD,
    warpImageData,
} from '../_shared/image/perspective';

/** Längste Kante der Bühne in CSS-Pixeln. */
const STAGE_MAX = 460;
const HANDLE_HIT = 24;
/** Längste Kante der Ergebnis-Vorschau — klein genug, um synchron zu rechnen. */
const PREVIEW_MAX = 150;
/** Lupe beim Ziehen einer Ecke: Kantenlänge, Vergrößerung, Abstand zum Bühnenrand. */
const LOUPE_SIZE = 112;
const LOUPE_ZOOM = 4;
const LOUPE_INSET = 8;

/** Ecken im Uhrzeigersinn ab links oben — Reihenfolge wie in `Quad`. */
const CORNER_LABELS = ['links oben', 'rechts oben', 'rechts unten', 'links unten'] as const;

type ImageResizeCanvasProps = {
    file: File;
    quad: Quad;
    onQuadChange: (quad: Quad) => void;
    maxWidth: string;
    maxHeight: string;
    disabled?: boolean;
};

type Natural = { width: number; height: number };

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function parseDimension(value: string): number | null {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function ImageResizeCanvas({
    file,
    quad,
    onQuadChange,
    maxWidth,
    maxHeight,
    disabled = false,
}: ImageResizeCanvasProps) {
    const [src, setSrc] = useState<string | null>(null);
    const [natural, setNatural] = useState<Natural | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [activeCorner, setActiveCorner] = useState<number | null>(null);
    const [focusedCorner, setFocusedCorner] = useState<number | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const stageRef = useRef<HTMLDivElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

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

    const cropped = !isUnitQuad(quad);

    /** Zielmaße des Cuts: Kantenlängen des Vierecks, gedeckelt durch die Zahlenfelder. */
    const outputSize = useMemo(() => {
        if (!natural) return null;
        const selection = quadNaturalSize(
            quad.map((point) => ({
                x: point.x * natural.width,
                y: point.y * natural.height,
            })) as Quad,
        );

        let width = Math.max(1, selection.width);
        let height = Math.max(1, selection.height);
        const limitW = parseDimension(maxWidth);
        const limitH = parseDimension(maxHeight);
        if (limitW && width > limitW) {
            height = (height * limitW) / width;
            width = limitW;
        }
        if (limitH && height > limitH) {
            width = (width * limitH) / height;
            height = limitH;
        }
        return { width: Math.max(1, Math.round(width)), height: Math.max(1, Math.round(height)) };
    }, [maxHeight, maxWidth, natural, quad]);

    /**
     * Ergebnis-Vorschau: derselbe Entzerrungspfad wie beim Export, nur klein
     * gerechnet. Das Hauptbild bleibt unverzerrt — verzerrt wird erst beim Cut.
     */
    useEffect(() => {
        const image = imageRef.current;
        if (!image || !natural || !outputSize || !cropped || !isConvexQuad(quad) || loadError) {
            setPreviewUrl(null);
            return;
        }

        let cancelled = false;
        let objectUrl: string | null = null;

        const timer = window.setTimeout(() => {
            // Seitenverhältnis der echten Ausgabe übernehmen, nur kleiner gerechnet —
            // sonst zeigt die Vorschau eine Form, die der Cut gar nicht liefert.
            const scale = PREVIEW_MAX / Math.max(outputSize.width, outputSize.height);
            const width = Math.max(1, Math.round(outputSize.width * scale));
            const height = Math.max(1, Math.round(outputSize.height * scale));

            const source = document.createElement('canvas');
            source.width = natural.width;
            source.height = natural.height;
            const sourceCtx = source.getContext('2d');
            if (!sourceCtx) return;
            sourceCtx.drawImage(image, 0, 0);

            const scaled = quad.map((point) => ({
                x: point.x * natural.width,
                y: point.y * natural.height,
            })) as Quad;
            const warped = warpImageData(
                sourceCtx.getImageData(0, 0, natural.width, natural.height),
                scaled,
                width,
                height,
            );
            if (!warped || cancelled) return;

            const out = document.createElement('canvas');
            out.width = width;
            out.height = height;
            out.getContext('2d')?.putImageData(warped.data, 0, 0);
            out.toBlob((blob) => {
                if (!blob || cancelled) return;
                objectUrl = URL.createObjectURL(blob);
                setPreviewUrl(objectUrl);
            });
        }, 120);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [cropped, loadError, natural, outputSize, quad]);

    const pointFromEvent = useCallback(
        (event: { clientX: number; clientY: number }): Point | null => {
            const rect = stageRef.current?.getBoundingClientRect();
            if (!rect || rect.width === 0 || rect.height === 0) return null;
            return {
                x: (event.clientX - rect.left) / rect.width,
                y: (event.clientY - rect.top) / rect.height,
            };
        },
        [],
    );

    const moveCorner = useCallback(
        (index: number, next: Point) => {
            const candidate = quad.map((point, i) =>
                i === index ? { x: clamp(next.x, 0, 1), y: clamp(next.y, 0, 1) } : point,
            ) as Quad;
            // Überschlagene Vierecke haben keine sinnvolle Entzerrung — verwerfen.
            if (!isConvexQuad(candidate)) return;
            onQuadChange(candidate);
        },
        [onQuadChange, quad],
    );

    const handlePointerDown = useCallback(
        (index: number) => (event: React.PointerEvent<HTMLButtonElement>) => {
            if (disabled) return;
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            setActiveCorner(index);
        },
        [disabled],
    );

    const handlePointerMove = useCallback(
        (index: number) => (event: React.PointerEvent<HTMLButtonElement>) => {
            if (disabled || activeCorner !== index) return;
            const point = pointFromEvent(event);
            if (point) moveCorner(index, point);
        },
        [activeCorner, disabled, moveCorner, pointFromEvent],
    );

    const endDrag = useCallback(() => setActiveCorner(null), []);

    /**
     * Lupe: beim Ziehen liegt Cursor bzw. Finger genau auf der Stelle, die man treffen
     * will. Auch bei Tastaturbedienung sichtbar, damit das Nudgen kontrollierbar bleibt.
     */
    const magnified = activeCorner ?? focusedCorner;

    const loupe = useMemo(() => {
        if (magnified === null || !stage || !natural || loadError) return null;
        const point = quad[magnified];

        // In die am weitesten entfernte Bühnenecke setzen, damit sie den Punkt
        // nie verdeckt.
        const corners = [
            { left: LOUPE_INSET, top: LOUPE_INSET, at: { x: 0, y: 0 } },
            { left: stage.width - LOUPE_SIZE - LOUPE_INSET, top: LOUPE_INSET, at: { x: 1, y: 0 } },
            {
                left: stage.width - LOUPE_SIZE - LOUPE_INSET,
                top: stage.height - LOUPE_SIZE - LOUPE_INSET,
                at: { x: 1, y: 1 },
            },
            {
                left: LOUPE_INSET,
                top: stage.height - LOUPE_SIZE - LOUPE_INSET,
                at: { x: 0, y: 1 },
            },
        ];
        const spot = corners.reduce((best, candidate) =>
            Math.hypot(candidate.at.x - point.x, candidate.at.y - point.y) >
            Math.hypot(best.at.x - point.x, best.at.y - point.y)
                ? candidate
                : best,
        );

        // Hintergrund in Originalpixeln skalieren, damit die Lupe echte Bildpixel
        // zeigt und nicht die bereits herunterskalierte Bühne.
        const sourceX = point.x * natural.width * LOUPE_ZOOM;
        const sourceY = point.y * natural.height * LOUPE_ZOOM;
        return {
            left: spot.left,
            top: spot.top,
            backgroundSize: `${natural.width * LOUPE_ZOOM}px ${natural.height * LOUPE_ZOOM}px`,
            backgroundPosition: `${LOUPE_SIZE / 2 - sourceX}px ${LOUPE_SIZE / 2 - sourceY}px`,
            label: `${Math.round(point.x * natural.width)}, ${Math.round(point.y * natural.height)}`,
        };
    }, [loadError, magnified, natural, quad, stage]);

    const handleKeyDown = useCallback(
        (index: number) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
            if (disabled || !natural) return;
            // Schrittweite in echten Bildpixeln, nicht in Bühnenpixeln — sonst wäre das
            // Nudgen bei großen Bildern gröber als die Lupe suggeriert.
            const amount = event.shiftKey ? 10 : 1;
            const stepX = amount / natural.width;
            const stepY = amount / natural.height;
            const deltas: Record<string, Point> = {
                ArrowLeft: { x: -stepX, y: 0 },
                ArrowRight: { x: stepX, y: 0 },
                ArrowUp: { x: 0, y: -stepY },
                ArrowDown: { x: 0, y: stepY },
            };
            const delta = deltas[event.key];
            if (!delta) return;
            event.preventDefault();
            moveCorner(index, { x: quad[index].x + delta.x, y: quad[index].y + delta.y });
        },
        [disabled, moveCorner, natural, quad],
    );

    if (!src) return null;

    const points = stage
        ? quad.map((point) => ({ x: point.x * stage.width, y: point.y * stage.height }))
        : [];

    return (
        <section className="space-y-3 rounded-xl border-2 border-black bg-white p-4 shadow-brutal-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-[13px] font-bold">Ausschnitt am Bild ziehen</p>
                {cropped ? (
                    <button
                        type="button"
                        className="ms-btn text-[12px]"
                        disabled={disabled}
                        onClick={() => onQuadChange(UNIT_QUAD)}
                    >
                        Zurücksetzen
                    </button>
                ) : null}
            </div>

            {loadError ? (
                <p className="text-[13px] text-[var(--color-ink-soft)]">
                    Vorschau nicht verfügbar — dieses Format kann der Browser nicht direkt anzeigen
                    (z. B. HEIC). Die Zahlenfelder funktionieren weiterhin.
                </p>
            ) : null}

            <div className="flex flex-wrap items-start justify-center gap-4">
                <div className="overflow-hidden rounded-[10px] bg-[var(--color-chip)] p-3">
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
                            ref={imageRef}
                            src={src}
                            alt={`Vorschau von ${file.name}`}
                            draggable={false}
                            className="block h-full w-full object-contain"
                            onLoad={(event) =>
                                setNatural({
                                    width: event.currentTarget.naturalWidth,
                                    height: event.currentTarget.naturalHeight,
                                })
                            }
                            onError={() => setLoadError(true)}
                        />

                        {stage ? (
                            <>
                                <svg
                                    className="pointer-events-none absolute inset-0 h-full w-full"
                                    aria-hidden
                                >
                                    <title>Ausschnitt</title>
                                    {/* Alles außerhalb des Vierecks abdunkeln. */}
                                    <defs>
                                        <mask id="ms-crop-mask">
                                            <rect
                                                width={stage.width}
                                                height={stage.height}
                                                fill="white"
                                            />
                                            <polygon
                                                points={points
                                                    .map((point) => `${point.x},${point.y}`)
                                                    .join(' ')}
                                                fill="black"
                                            />
                                        </mask>
                                    </defs>
                                    <rect
                                        width={stage.width}
                                        height={stage.height}
                                        fill="rgba(0,0,0,0.45)"
                                        mask="url(#ms-crop-mask)"
                                    />
                                    <polygon
                                        points={points
                                            .map((point) => `${point.x},${point.y}`)
                                            .join(' ')}
                                        fill="none"
                                        stroke="#fff"
                                        strokeWidth={3}
                                    />
                                    <polygon
                                        points={points
                                            .map((point) => `${point.x},${point.y}`)
                                            .join(' ')}
                                        fill="none"
                                        stroke="#000"
                                        strokeWidth={1.5}
                                    />
                                </svg>

                                {points.map((point, index) => (
                                    <button
                                        key={CORNER_LABELS[index]}
                                        type="button"
                                        aria-label={`Ecke ${CORNER_LABELS[index]} ziehen`}
                                        disabled={disabled}
                                        className="absolute rounded-full border-2 border-black bg-white shadow-brutal-sm disabled:opacity-50"
                                        style={{
                                            width: `${HANDLE_HIT}px`,
                                            height: `${HANDLE_HIT}px`,
                                            left: `${point.x - HANDLE_HIT / 2}px`,
                                            top: `${point.y - HANDLE_HIT / 2}px`,
                                            cursor: disabled ? 'not-allowed' : 'grab',
                                            touchAction: 'none',
                                        }}
                                        onPointerDown={handlePointerDown(index)}
                                        onPointerMove={handlePointerMove(index)}
                                        onPointerUp={endDrag}
                                        onPointerCancel={endDrag}
                                        onKeyDown={handleKeyDown(index)}
                                        onFocus={() => setFocusedCorner(index)}
                                        onBlur={() =>
                                            setFocusedCorner((prev) =>
                                                prev === index ? null : prev,
                                            )
                                        }
                                    />
                                ))}

                                {loupe ? (
                                    <div
                                        className="pointer-events-none absolute overflow-hidden rounded-full border-2 border-black bg-white shadow-brutal-sm"
                                        style={{
                                            width: `${LOUPE_SIZE}px`,
                                            height: `${LOUPE_SIZE}px`,
                                            left: `${loupe.left}px`,
                                            top: `${loupe.top}px`,
                                            backgroundImage: `url(${src})`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: loupe.backgroundSize,
                                            backgroundPosition: loupe.backgroundPosition,
                                            imageRendering: 'pixelated',
                                        }}
                                    >
                                        {/* Fadenkreuz auf der Position der Ecke. */}
                                        <span className="absolute left-0 right-0 top-1/2 block h-px bg-black/70" />
                                        <span className="absolute bottom-0 left-1/2 top-0 block w-px bg-black/70" />
                                        <span className="absolute inset-x-0 bottom-0 bg-black/70 text-center font-mono text-[10px] leading-[14px] text-white">
                                            {loupe.label}
                                        </span>
                                    </div>
                                ) : null}
                            </>
                        ) : null}
                    </div>
                </div>

                {cropped ? (
                    <div className="space-y-2">
                        <p className="font-display text-[12px] font-bold">Nach dem Cut</p>
                        <div
                            className="flex items-center justify-center rounded-[10px] border-2 border-black bg-[var(--color-chip)] p-2"
                            style={{ minWidth: '90px', minHeight: '90px' }}
                        >
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Vorschau des entzerrten Ausschnitts"
                                    className="block max-h-[150px] max-w-[150px]"
                                />
                            ) : (
                                <span className="text-[11px] text-[var(--color-ink-soft)]">
                                    berechne …
                                </span>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                <p className="text-[var(--color-ink-soft)]">
                    Alle vier Ecken einzeln ziehen — beim Ziehen zeigt eine Lupe die Stelle in
                    Originalpixeln. Pfeiltasten bewegen um 1 Bildpixel, mit Shift um 10. Entzerrt
                    wird erst beim Cut.
                </p>
                {outputSize ? (
                    <p className="ms-badge bg-[var(--color-chip)] px-2 py-1" aria-live="polite">
                        Ausgabe: {outputSize.width} × {outputSize.height} px
                    </p>
                ) : null}
            </div>
        </section>
    );
}
