import { canvasToBlob, drawToCanvas, formatFromBlob, loadImageBitmap } from './canvas';
import { convertImage } from './convert';
import { getFormat } from './formats';
import type { ImageFormatId } from './types';

export type CompressOptions = {
    quality: number;
    format?: ImageFormatId;
};

export async function compressImage(
    blob: Blob,
    filename: string,
    options: CompressOptions,
): Promise<Blob> {
    const quality = Math.max(0.1, Math.min(1, options.quality));
    const formatId = options.format ?? formatFromBlob(blob, filename);
    const sourceFormat = formatFromBlob(blob, filename);

    if (sourceFormat === 'heic') {
        return convertImage(blob, 'heic', formatId, { quality });
    }

    const target = getFormat(formatId);
    const bitmap = await loadImageBitmap(blob);
    const canvas = await drawToCanvas(bitmap, bitmap.width, bitmap.height, (ctx) => {
        ctx.drawImage(bitmap, 0, 0);
    });
    bitmap.close();
    return canvasToBlob(canvas, target.mime, quality);
}
