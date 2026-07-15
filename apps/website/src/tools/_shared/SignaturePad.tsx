import { useEffect, useRef } from 'react';

type SignaturePadProps = {
    onChange: (hasInk: boolean) => void;
    canvasRef?: React.RefObject<HTMLCanvasElement | null>;
};

export function SignaturePad({ onChange, canvasRef: externalRef }: SignaturePadProps) {
    const internalRef = useRef<HTMLCanvasElement | null>(null);
    const canvasRef = externalRef ?? internalRef;
    const drawingRef = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, [canvasRef]);

    function pointerPos(event: React.PointerEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY,
        };
    }

    function startDraw(event: React.PointerEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        drawingRef.current = true;
        canvas.setPointerCapture(event.pointerId);
        const { x, y } = pointerPos(event);
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    function draw(event: React.PointerEvent<HTMLCanvasElement>) {
        if (!drawingRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const { x, y } = pointerPos(event);
        ctx.lineTo(x, y);
        ctx.stroke();
        onChange(true);
    }

    function endDraw(event: React.PointerEvent<HTMLCanvasElement>) {
        if (!drawingRef.current) return;
        drawingRef.current = false;
        canvasRef.current?.releasePointerCapture(event.pointerId);
    }

    function clear() {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        onChange(false);
    }

    return (
        <div className="space-y-2">
            <canvas
                ref={canvasRef}
                width={480}
                height={160}
                className="w-full cursor-crosshair rounded-lg border-2 border-black bg-white touch-none"
                aria-label="Unterschrift zeichnen"
                onPointerDown={startDraw}
                onPointerMove={draw}
                onPointerUp={endDraw}
                onPointerLeave={endDraw}
            />
            <button type="button" className="ms-btn px-3 py-1 text-[12px]" onClick={clear}>
                Unterschrift löschen
            </button>
        </div>
    );
}

export function signaturePadToPng(canvas: HTMLCanvasElement | null): Uint8Array | null {
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let hasInk = false;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) {
            hasInk = true;
            break;
        }
    }
    if (!hasInk) return null;
    const url = canvas.toDataURL('image/png');
    const base64 = url.split(',')[1];
    if (!base64) return null;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
}
