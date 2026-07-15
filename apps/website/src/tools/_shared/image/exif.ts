import { reencodeViaCanvas, formatFromBlob } from './canvas';
import { convertImage } from './convert';
import type { ImageFormatId } from './types';

export type StripExifOptions = {
    format?: ImageFormatId;
    quality?: number;
};

/** Re-encode via canvas — strips EXIF/GPS and other metadata. */
export async function stripExif(
    blob: Blob,
    filename: string,
    options?: StripExifOptions,
): Promise<Blob> {
    const sourceFormat = formatFromBlob(blob, filename);
    const formatId = options?.format ?? (sourceFormat === 'heic' ? 'jpg' : sourceFormat);
    const quality = options?.quality ?? 0.92;

    if (sourceFormat === 'heic') {
        const converted = await convertImage(blob, 'heic', formatId, { quality });
        if (formatId === 'png' || formatId === 'webp') {
            return reencodeViaCanvas(converted, formatId, quality);
        }
        return converted;
    }

    return reencodeViaCanvas(blob, formatId, quality);
}
