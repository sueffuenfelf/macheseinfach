/** Normalized axis-aligned crop: origin top-left, values 0–1. */
export type CropRect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export const FULL_CROP: CropRect = { x: 0, y: 0, width: 1, height: 1 };

export function isFullCrop(rect: CropRect): boolean {
    return rect.x <= 0.001 && rect.y <= 0.001 && rect.width >= 0.999 && rect.height >= 0.999;
}

export function clampCropRect(rect: CropRect): CropRect {
    const width = Math.min(1, Math.max(0.01, rect.width));
    const height = Math.min(1, Math.max(0.01, rect.height));
    const x = Math.min(Math.max(0, rect.x), 1 - width);
    const y = Math.min(Math.max(0, rect.y), 1 - height);
    return { x, y, width, height };
}

/** Crop with fixed aspect ratio (width / height). Keeps rect inside image bounds. */
export function cropRectWithAspect(
    rect: CropRect,
    aspect: number,
    anchor: 'center' | 'top-left' = 'center',
): CropRect {
    if (!Number.isFinite(aspect) || aspect <= 0) return clampCropRect(rect);

    let width = rect.width;
    let height = width / aspect;
    if (height > rect.height) {
        height = rect.height;
        width = height * aspect;
    }

    let x = rect.x;
    let y = rect.y;
    if (anchor === 'center') {
        x = rect.x + (rect.width - width) / 2;
        y = rect.y + (rect.height - height) / 2;
    }

    return clampCropRect({ x, y, width, height });
}

export function cropNaturalSize(
    rect: CropRect,
    imageWidth: number,
    imageHeight: number,
): { width: number; height: number } {
    return {
        width: Math.max(1, Math.round(rect.width * imageWidth)),
        height: Math.max(1, Math.round(rect.height * imageHeight)),
    };
}
