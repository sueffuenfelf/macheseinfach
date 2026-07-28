import { canvasToBlob, drawToCanvas, formatFromBlob, loadImageBitmap } from './canvas';
import { convertImage } from './convert';
import { getFormat } from './formats';
import type { ImageFormatId } from './types';
import {
    watermarkAnchor,
    type WatermarkPosition,
} from './watermark-position';

export type { WatermarkPosition } from './watermark-position';
export { watermarkAnchor } from './watermark-position';

export type WatermarkOptions = {
    text: string;
    position?: WatermarkPosition;
    /** 0–1 */
    opacity?: number;
    /** Relative to image width, e.g. 0.05 = 5 % */
    fontScale?: number;
    format?: ImageFormatId;
    quality?: number;
};

const OPAQUE_FORMATS = new Set<ImageFormatId>(['jpg']);

export async function watermarkImage(
    blob: Blob,
    filename: string,
    options: WatermarkOptions,
): Promise<Blob> {
    const text = options.text.trim();
    if (!text) throw new Error('Wasserzeichen-Text fehlt');

    const sourceFormat = formatFromBlob(blob, filename);
    const formatId = options.format ?? (sourceFormat === 'heic' ? 'jpg' : sourceFormat);
    const quality = options?.quality ?? 0.92;
    const opacity = Math.min(1, Math.max(0.05, options.opacity ?? 0.5));
    const position = options.position ?? 'bottom-right';
    const fontScale = options.fontScale ?? 0.05;

    let workingBlob = blob;
    if (sourceFormat === 'heic') {
        workingBlob = await convertImage(blob, 'heic', formatId === 'heic' ? 'jpg' : formatId);
    }

    const bitmap = await loadImageBitmap(workingBlob);
    const target = getFormat(formatId === 'heic' ? 'jpg' : formatId);
    const fontSize = Math.max(12, Math.round(bitmap.width * fontScale));
    const padding = Math.round(fontSize * 0.6);

    const canvas = await drawToCanvas(bitmap, bitmap.width, bitmap.height, (ctx) => {
        if (OPAQUE_FORMATS.has(target.id)) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, bitmap.width, bitmap.height);
        }
        ctx.drawImage(bitmap, 0, 0);

        ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
        ctx.textBaseline = 'alphabetic';
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize;
        const { x, y } = watermarkAnchor(
            position,
            bitmap.width,
            bitmap.height,
            textWidth,
            textHeight,
            padding,
        );

        ctx.globalAlpha = opacity;
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1, fontSize * 0.08);
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        ctx.globalAlpha = 1;
    });
    bitmap.close();

    return canvasToBlob(canvas, target.mime, quality);
}
