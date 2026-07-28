export type PaperFormat = 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8';

/** ISO 216 A-series dimensions in mm (portrait: width × height). */
export const A_SERIES_MM: Record<PaperFormat, { width: number; height: number }> = {
    A0: { width: 841, height: 1189 },
    A1: { width: 594, height: 841 },
    A2: { width: 420, height: 594 },
    A3: { width: 297, height: 420 },
    A4: { width: 210, height: 297 },
    A5: { width: 148, height: 210 },
    A6: { width: 105, height: 148 },
    A7: { width: 74, height: 105 },
    A8: { width: 52, height: 74 },
};

const INCHES_PER_MM = 1 / 25.4;

export function paperPxAtDpi(mm: number, dpi: number): number {
    return Math.round(mm * dpi * INCHES_PER_MM);
}

/** Match custom mm dimensions to a known format (±1 mm tolerance). */
export function matchPaperFormat(
    widthMm: number,
    heightMm: number,
    toleranceMm = 1,
): PaperFormat | null {
    const w = Math.min(widthMm, heightMm);
    const h = Math.max(widthMm, heightMm);
    for (const [format, dims] of Object.entries(A_SERIES_MM)) {
        const fw = Math.min(dims.width, dims.height);
        const fh = Math.max(dims.width, dims.height);
        if (Math.abs(w - fw) <= toleranceMm && Math.abs(h - fh) <= toleranceMm) {
            return format as PaperFormat;
        }
    }
    return null;
}
