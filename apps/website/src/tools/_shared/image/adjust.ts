import { canvasToBlob, drawToCanvas, formatFromBlob, loadImageBitmap } from './canvas';
import { convertImage } from './convert';
import {
    brightnessContrastFilter,
    clampAdjustValue,
    type BrightnessContrast,
    isNeutralAdjust,
} from './adjust-filters';
import { getFormat } from './formats';
import type { ImageFormatId } from './types';

export type { BrightnessContrast } from './adjust-filters';
export {
    clampAdjustValue,
    brightnessContrastFilter,
    isNeutralAdjust,
} from './adjust-filters';

export type AdjustOptions = BrightnessContrast & {
    format?: ImageFormatId;
    quality?: number;
};

export async function adjustImage(
    blob: Blob,
    filename: string,
    options: AdjustOptions,
): Promise<Blob> {
    const sourceFormat = formatFromBlob(blob, filename);
    const formatId = options.format ?? (sourceFormat === 'heic' ? 'jpg' : sourceFormat);
    const quality = options?.quality ?? 0.92;

    let workingBlob = blob;
    if (sourceFormat === 'heic') {
        workingBlob = await convertImage(blob, 'heic', formatId === 'heic' ? 'jpg' : formatId);
    }

    const bitmap = await loadImageBitmap(workingBlob);
    const target = getFormat(formatId === 'heic' ? 'jpg' : formatId);
    const filter = brightnessContrastFilter(options);

    const canvas = await drawToCanvas(bitmap, bitmap.width, bitmap.height, (ctx) => {
        ctx.filter = filter;
        ctx.drawImage(bitmap, 0, 0);
    });
    bitmap.close();

    return canvasToBlob(canvas, target.mime, quality);
}
