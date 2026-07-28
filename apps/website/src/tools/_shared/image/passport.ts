import { cmToPx } from '../units';
import type { CropRect } from './crop-rect';

/** Biometrisches Passfoto (DE) — Breite × Höhe in mm. */
export const PASSPORT_WIDTH_MM = 35;
export const PASSPORT_HEIGHT_MM = 45;

export const PASSPORT_ASPECT = PASSPORT_WIDTH_MM / PASSPORT_HEIGHT_MM;

export type PassportDpiPreset = 300 | 600;

export function passportPixelSize(dpi: number): { width: number; height: number } {
    return {
        width: Math.round(cmToPx(PASSPORT_WIDTH_MM / 10, dpi)),
        height: Math.round(cmToPx(PASSPORT_HEIGHT_MM / 10, dpi)),
    };
}

export type PassportCheckResult = {
    ok: boolean;
    tone: 'success' | 'warn' | 'danger' | 'info';
    heading: string;
    details: { label: string; value: string }[];
};

export function checkPassportDimensions(
    widthPx: number,
    heightPx: number,
    dpi: number,
): PassportCheckResult {
    const target = passportPixelSize(dpi);
    const aspect = widthPx / heightPx;
    const aspectOk = Math.abs(aspect - PASSPORT_ASPECT) < 0.02;
    const widthOk = Math.abs(widthPx - target.width) <= 2;
    const heightOk = Math.abs(heightPx - target.height) <= 2;
    const sizeOk = widthOk && heightOk;

    const details = [
        { label: 'Pixel', value: `${widthPx} × ${heightPx}` },
        { label: 'Ziel bei ' + dpi + ' DPI', value: `${target.width} × ${target.height} px` },
        {
            label: 'Seitenverhältnis',
            value: aspectOk
                ? `35:45 (${aspect.toFixed(3)})`
                : `${aspect.toFixed(3)} — erwartet ${PASSPORT_ASPECT.toFixed(3)}`,
        },
        { label: 'Maße', value: `${PASSPORT_WIDTH_MM} × ${PASSPORT_HEIGHT_MM} mm` },
    ];

    if (sizeOk && aspectOk) {
        return {
            ok: true,
            tone: 'success',
            heading: `Passfoto-Maße passen (${dpi} DPI)`,
            details,
        };
    }

    if (aspectOk && !sizeOk) {
        return {
            ok: false,
            tone: 'warn',
            heading: 'Seitenverhältnis stimmt — Auflösung weicht ab',
            details,
        };
    }

    return {
        ok: false,
        tone: 'danger',
        heading: 'Abweichung von Passfoto-Maßen',
        details,
    };
}

/** Centered crop rect with passport aspect inside the full image. */
export function defaultPassportCrop(imageWidth: number, imageHeight: number): CropRect {
    const imageAspect = imageWidth / imageHeight;
    let width = 1;
    let height = 1;
    if (imageAspect > PASSPORT_ASPECT) {
        height = 1;
        width = PASSPORT_ASPECT / imageAspect;
    } else {
        width = 1;
        height = imageAspect / PASSPORT_ASPECT;
    }
    return {
        x: (1 - width) / 2,
        y: (1 - height) / 2,
        width,
        height,
    };
}
