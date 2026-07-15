import heic2any from 'heic2any';
import { getFormat } from './formats';
import type { ConvertOptions, ImageFormatId } from './types';

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) =>
                blob ? resolve(blob) : reject(new Error('Canvas-Konvertierung fehlgeschlagen')),
            mime,
            quality ?? 0.92,
        );
    });
}

async function convertViaCanvas(
    blob: Blob,
    to: ImageFormatId,
    options?: ConvertOptions,
): Promise<Blob> {
    const target = getFormat(to);
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas-Kontext nicht verfügbar');
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return canvasToBlob(canvas, target.mime, options?.quality);
}

async function convertHeic(blob: Blob, to: ImageFormatId, options?: ConvertOptions): Promise<Blob> {
    const target = getFormat(to);
    const result = await heic2any({
        blob,
        toType: target.mime,
        quality: options?.quality ?? 0.92,
    });
    return (Array.isArray(result) ? result[0] : result) as Blob;
}

export async function convertImage(
    blob: Blob,
    from: ImageFormatId,
    to: ImageFormatId,
    options?: ConvertOptions,
): Promise<Blob> {
    if (from === to) return blob;
    if (from === 'heic') return convertHeic(blob, to, options);
    return convertViaCanvas(blob, to, options);
}

export function outputExtension(formatId: ImageFormatId): string {
    return formatId === 'jpg' ? 'jpg' : formatId;
}

export function outputFilename(inputName: string, to: ImageFormatId): string {
    const ext = outputExtension(to);
    const base = inputName.replace(/\.[^.]+$/, '') || 'bild';
    return `${base}.${ext}`;
}
