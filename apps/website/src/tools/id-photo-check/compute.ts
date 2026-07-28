import type { CheckResult } from '../_shared/shells/types';

/** ICAO / German passport photo: 35×45 mm. */
export const PASSPORT_MM = { width: 35, height: 45 } as const;
export const PASSPORT_ASPECT = PASSPORT_MM.width / PASSPORT_MM.height; // 7/9

/** Common portal hints (not legal requirements). */
export const PASSPORT_HINTS = {
    minPxShort: 413, // ~35 mm @ 300 dpi
    minPxLong: 531, // ~45 mm @ 300 dpi
    maxBytes: 5 * 1024 * 1024,
    preferredMaxBytes: 2 * 1024 * 1024,
    aspectTolerance: 0.04,
} as const;

export type IdPhotoInput = {
    widthPx: number;
    heightPx: number;
    bytes: number;
    mime?: string;
};

function approxDpi(px: number, mm: number): number {
    return Math.round((px / mm) * 25.4);
}

/**
 * Check passport/ID photo dimensions and filesize hints.
 * Pure — call after reading image metadata from a file.
 */
export function checkIdPhoto(input: IdPhotoInput): CheckResult {
    const { widthPx, heightPx, bytes } = input;
    if (!widthPx || !heightPx || widthPx < 1 || heightPx < 1) {
        return {
            ok: false,
            tone: 'danger',
            heading: 'Kein Bild',
            message: 'Bitte ein Passfoto (JPG/PNG) laden.',
        };
    }

    const short = Math.min(widthPx, heightPx);
    const long = Math.max(widthPx, heightPx);
    const portrait = heightPx >= widthPx;
    const aspect = widthPx / heightPx;
    const aspectOk = Math.abs(aspect - PASSPORT_ASPECT) <= PASSPORT_HINTS.aspectTolerance;
    const sizeOk =
        short >= PASSPORT_HINTS.minPxShort * 0.9 && long >= PASSPORT_HINTS.minPxLong * 0.9;
    const bytesOk = bytes > 0 && bytes <= PASSPORT_HINTS.maxBytes;
    const bytesPreferred = bytes > 0 && bytes <= PASSPORT_HINTS.preferredMaxBytes;

    const issues: string[] = [];
    if (!portrait) issues.push('Hochformat erwartet (Höhe ≥ Breite)');
    if (!aspectOk) {
        issues.push(
            `Seitenverhältnis ${aspect.toFixed(3)} — Ziel ≈ ${PASSPORT_ASPECT.toFixed(3)} (35×45 mm)`,
        );
    }
    if (!sizeOk) {
        issues.push(
            `Auflösung niedrig (${widthPx}×${heightPx}) — oft ≥ ${PASSPORT_HINTS.minPxShort}×${PASSPORT_HINTS.minPxLong} px (~300 dpi)`,
        );
    }
    if (!bytesOk) issues.push(`Datei zu groß (${formatMb(bytes)}) — oft max. 5 MB`);
    else if (!bytesPreferred) {
        issues.push(`Datei eher groß (${formatMb(bytes)}) — Portale wollen oft ≤ 2 MB`);
    }

    const dpiW = approxDpi(widthPx, PASSPORT_MM.width);
    const dpiH = approxDpi(heightPx, PASSPORT_MM.height);
    const softOnly = issues.length === 1 && issues[0]!.includes('eher groß');

    return {
        ok: issues.length === 0 || softOnly,
        tone: issues.length === 0 ? 'success' : softOnly ? 'warn' : 'danger',
        heading:
            issues.length === 0
                ? 'Passt zu üblichen Passfoto-Hinweisen'
                : softOnly
                  ? 'Grundsätzlich ok — Größe prüfen'
                  : 'Abweichungen gefunden',
        summary: `${widthPx}×${heightPx} px · ${formatMb(bytes)}`,
        message:
            issues.length === 0
                ? 'Maße und Dateigröße wirken portal-tauglich. Hintergrund und biometrische Vorgaben prüfst du separat.'
                : issues.join(' · '),
        details: [
            { label: 'Pixel', value: `${widthPx} × ${heightPx}` },
            {
                label: 'Seitenverhältnis',
                value: `${aspect.toFixed(3)} (Ziel ${PASSPORT_ASPECT.toFixed(3)})`,
            },
            { label: '≈ DPI (35×45 mm)', value: `${dpiW} × ${dpiH}` },
            { label: 'Dateigröße', value: formatMb(bytes) },
            { label: 'Format', value: input.mime || '—' },
        ],
    };
}

function formatMb(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function loadImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Bild konnte nicht geladen werden.'));
        };
        img.src = url;
    });
}
