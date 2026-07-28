export type CompressStatus = 'under_limit' | 'over_limit' | 'limit_unreachable';

export type CompressSettings = {
    quality: number;
    scale: number;
};

export const DEFAULT_COMPRESS_SETTINGS: CompressSettings = {
    quality: 0.75,
    scale: 1,
};

export const ELSTER_TARGET_BYTES = 2 * 1024 * 1024;

const MIN_QUALITY = 0.35;
const MIN_SCALE = 0.45;
const QUALITY_STEP = 0.08;
const SCALE_STEP = 0.1;

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function resolveCompressStatus(
    compressedSize: number,
    targetBytes: number,
    atFloor: boolean,
): CompressStatus {
    if (compressedSize <= targetBytes) return 'under_limit';
    if (atFloor) return 'limit_unreachable';
    return 'over_limit';
}

export function nextCompressSettings(current: CompressSettings): CompressSettings | null {
    if (current.quality > MIN_QUALITY + QUALITY_STEP) {
        return {
            quality: clamp(current.quality - QUALITY_STEP, MIN_QUALITY, 1),
            scale: current.scale,
        };
    }
    if (current.scale > MIN_SCALE + SCALE_STEP) {
        return {
            quality: MIN_QUALITY,
            scale: clamp(current.scale - SCALE_STEP, MIN_SCALE, 1),
        };
    }
    return null;
}

export type CompressOptions = CompressSettings & {
    targetBytes: number;
    autoFit?: boolean;
};

export type CompressResult = {
    bytes: Uint8Array;
    originalSize: number;
    compressedSize: number;
    settings: CompressSettings;
    status: CompressStatus;
};

export function clampCompressSettings(settings: CompressSettings): CompressSettings {
    return {
        quality: clamp(settings.quality, MIN_QUALITY, 1),
        scale: clamp(settings.scale, MIN_SCALE, 1),
    };
}
