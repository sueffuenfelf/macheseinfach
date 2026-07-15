import { getFormat } from './formats';
import type { ImageFormatId } from './types';

export function canvasToBlob(
    canvas: HTMLCanvasElement,
    mime: string,
    quality?: number,
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) =>
                blob ? resolve(blob) : reject(new Error('Canvas-Konvertierung fehlgeschlagen')),
            mime,
            quality ?? 0.92,
        );
    });
}

export async function loadImageBitmap(blob: Blob): Promise<ImageBitmap> {
    return createImageBitmap(blob);
}

export async function drawToCanvas(
    bitmap: ImageBitmap,
    width: number,
    height: number,
    draw: (ctx: CanvasRenderingContext2D) => void,
): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas-Kontext nicht verfügbar');
    draw(ctx);
    return canvas;
}

export async function reencodeViaCanvas(
    blob: Blob,
    formatId: ImageFormatId,
    quality?: number,
): Promise<Blob> {
    const target = getFormat(formatId);
    const bitmap = await loadImageBitmap(blob);
    const canvas = await drawToCanvas(bitmap, bitmap.width, bitmap.height, (ctx) => {
        ctx.drawImage(bitmap, 0, 0);
    });
    bitmap.close();
    return canvasToBlob(canvas, target.mime, quality);
}

export function formatFromBlob(blob: Blob, filename: string): ImageFormatId {
    const mime = blob.type.toLowerCase();
    if (mime.includes('png')) return 'png';
    if (mime.includes('webp')) return 'webp';
    if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
    if (mime.includes('heic') || mime.includes('heif')) return 'heic';
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'png') return 'png';
    if (ext === 'webp') return 'webp';
    if (ext === 'jpg' || ext === 'jpeg') return 'jpg';
    if (ext === 'heic' || ext === 'heif') return 'heic';
    return 'jpg';
}
