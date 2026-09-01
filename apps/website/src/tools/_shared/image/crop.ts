import { canvasToBlob, drawToCanvas, formatFromBlob, loadImageBitmap } from './canvas';
import { convertImage } from './convert';
import { clampCropRect, type CropRect } from './crop-rect';
import { getFormat } from './formats';
import type { ImageFormatId } from './types';

export type { CropRect } from './crop-rect';
export {
    FULL_CROP,
    isFullCrop,
    clampCropRect,
    cropRectWithAspect,
    cropNaturalSize,
} from './crop-rect';

export type CropOptions = {
    format?: ImageFormatId;
    quality?: number;
};

const OPAQUE_FORMATS = new Set<ImageFormatId>(['jpg']);

export async function cropImage(
    blob: Blob,
    filename: string,
    rect: CropRect,
    options?: CropOptions,
): Promise<Blob> {
    const sourceFormat = formatFromBlob(blob, filename);
    const formatId = options?.format ?? (sourceFormat === 'heic' ? 'jpg' : sourceFormat);
    const quality = options?.quality ?? 0.92;
    const safe = clampCropRect(rect);

    let workingBlob = blob;
    if (sourceFormat === 'heic') {
        workingBlob = await convertImage(blob, 'heic', formatId === 'heic' ? 'jpg' : formatId);
    }

    const bitmap = await loadImageBitmap(workingBlob);
    const target = getFormat(formatId === 'heic' ? 'jpg' : formatId);

    const sx = Math.round(safe.x * bitmap.width);
    const sy = Math.round(safe.y * bitmap.height);
    const sw = Math.max(1, Math.round(safe.width * bitmap.width));
    const sh = Math.max(1, Math.round(safe.height * bitmap.height));

    const canvas = await drawToCanvas(bitmap, sw, sh, (ctx) => {
        if (OPAQUE_FORMATS.has(target.id)) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, sw, sh);
        }
        ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh);
    });
    bitmap.close();

    return canvasToBlob(canvas, target.mime, quality);
}
