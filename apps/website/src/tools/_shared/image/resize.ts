import { canvasToBlob, drawToCanvas, formatFromBlob, loadImageBitmap } from './canvas';
import { convertImage } from './convert';
import { getFormat } from './formats';
import { computeResizeDimensions } from './resize-dimensions';
import type { ImageFormatId } from './types';

export { computeResizeDimensions } from './resize-dimensions';

export type ResizeOptions = {
    maxWidth?: number;
    maxHeight?: number;
    format?: ImageFormatId;
    quality?: number;
};

export async function resizeImage(
    blob: Blob,
    filename: string,
    options: ResizeOptions,
): Promise<Blob> {
    const sourceFormat = formatFromBlob(blob, filename);
    const formatId = options.format ?? sourceFormat;
    const quality = options.quality ?? 0.92;

    let workingBlob = blob;
    if (sourceFormat === 'heic') {
        workingBlob = await convertImage(blob, 'heic', formatId === 'heic' ? 'jpg' : formatId);
    }

    const bitmap = await loadImageBitmap(workingBlob);
    const { width, height } = computeResizeDimensions(
        bitmap.width,
        bitmap.height,
        options.maxWidth,
        options.maxHeight,
    );

    const canvas = await drawToCanvas(bitmap, width, height, (ctx) => {
        ctx.drawImage(bitmap, 0, 0, width, height);
    });
    bitmap.close();

    const target = getFormat(formatId === 'heic' ? 'jpg' : formatId);
    return canvasToBlob(canvas, target.mime, quality);
}
