import type { ImageFormat, ImageFormatId } from './types';

export const IMAGE_FORMATS: Record<ImageFormatId, ImageFormat> = {
    heic: {
        id: 'heic',
        label: 'HEIC',
        mime: 'image/heic',
        extensions: ['heic', 'heif'],
        convertTo: ['jpg', 'png'],
        status: 'live',
    },
    png: {
        id: 'png',
        label: 'PNG',
        mime: 'image/png',
        extensions: ['png'],
        convertTo: ['png', 'jpg', 'webp'],
        status: 'live',
    },
    jpg: {
        id: 'jpg',
        label: 'JPG',
        mime: 'image/jpeg',
        extensions: ['jpg', 'jpeg'],
        convertTo: ['png', 'jpg', 'webp'],
        status: 'live',
    },
    webp: {
        id: 'webp',
        label: 'WebP',
        mime: 'image/webp',
        extensions: ['webp'],
        convertTo: ['png', 'jpg', 'webp'],
        status: 'live',
    },
    tiff: {
        id: 'tiff',
        label: 'TIFF',
        mime: 'image/tiff',
        extensions: ['tiff', 'tif'],
        convertTo: [],
        status: 'planned',
    },
    avif: {
        id: 'avif',
        label: 'AVIF',
        mime: 'image/avif',
        extensions: ['avif'],
        convertTo: [],
        status: 'planned',
    },
    gif: {
        id: 'gif',
        label: 'GIF',
        mime: 'image/gif',
        extensions: ['gif'],
        convertTo: [],
        status: 'planned',
    },
};

export const LIVE_FORMAT_IDS = (Object.keys(IMAGE_FORMATS) as ImageFormatId[]).filter(
    (id) => IMAGE_FORMATS[id].status === 'live',
);

export function getFormat(id: ImageFormatId): ImageFormat {
    return IMAGE_FORMATS[id];
}

export function formatFromExtension(ext: string): ImageFormatId | null {
    const normalized = ext.toLowerCase();
    for (const format of Object.values(IMAGE_FORMATS)) {
        if (format.extensions.includes(normalized)) return format.id;
    }
    return null;
}

export function formatFromFilename(filename: string): ImageFormatId | null {
    const ext = filename.split('.').pop();
    if (!ext) return null;
    return formatFromExtension(ext);
}

export function liveTargetFormats(from: ImageFormatId): ImageFormatId[] {
    const source = getFormat(from);
    if (source.status !== 'live') return [];
    return source.convertTo.filter((id) => getFormat(id).status === 'live');
}
