import { canvasToBlob, drawToCanvas, formatFromBlob, loadImageBitmap } from './canvas';
import { convertImage } from './convert';
import { getFormat } from './formats';
import type { ImageFormatId } from './types';

export type RotateAngle = 90 | 180 | 270;

export type RotateOptions = {
    angle?: RotateAngle;
    flipH?: boolean;
    flipV?: boolean;
    format?: ImageFormatId;
    quality?: number;
};

export function rotatedDimensions(
    width: number,
    height: number,
    angle: RotateAngle,
): { width: number; height: number } {
    if (angle === 90 || angle === 270) return { width: height, height: width };
    return { width, height };
}

export async function rotateImage(
    blob: Blob,
    filename: string,
    options: RotateOptions,
): Promise<Blob> {
    const sourceFormat = formatFromBlob(blob, filename);
    const formatId = options.format ?? (sourceFormat === 'heic' ? 'jpg' : sourceFormat);
    const quality = options.quality ?? 0.92;
    const angle = options.angle;
    const flipH = options.flipH ?? false;
    const flipV = options.flipV ?? false;

    if (!angle && !flipH && !flipV) return blob;

    let workingBlob = blob;
    if (sourceFormat === 'heic') {
        workingBlob = await convertImage(blob, 'heic', formatId);
    }

    const bitmap = await loadImageBitmap(workingBlob);
    const { width, height } = angle
        ? rotatedDimensions(bitmap.width, bitmap.height, angle)
        : { width: bitmap.width, height: bitmap.height };

    const canvas = await drawToCanvas(bitmap, width, height, (ctx) => {
        ctx.translate(width / 2, height / 2);
        if (angle === 90) ctx.rotate(Math.PI / 2);
        else if (angle === 180) ctx.rotate(Math.PI);
        else if (angle === 270) ctx.rotate(-Math.PI / 2);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
    });
    bitmap.close();

    const target = getFormat(formatId);
    return canvasToBlob(canvas, target.mime, quality);
}
