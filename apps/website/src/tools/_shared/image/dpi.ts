import { pxToCm } from '../units';

export type ImageDpiCheckInput = {
    widthPx: number;
    heightPx: number;
    fileSizeBytes?: number;
    assumedDpi?: number;
};

export type ImageDpiFinding = {
    label: string;
    value: string;
    ok?: boolean;
};

export type ImageDpiCheckResult = {
    ok: boolean;
    tone: 'success' | 'warn' | 'danger' | 'info';
    heading: string;
    details: ImageDpiFinding[];
};

const CM_PER_INCH = 2.54;

export function effectiveDpi(px: number, cm: number): number {
    if (cm <= 0) return Number.NaN;
    return px / (cm / CM_PER_INCH);
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function checkImageDpi(input: ImageDpiCheckInput): ImageDpiCheckResult {
    const { widthPx, heightPx, fileSizeBytes, assumedDpi = 300 } = input;
    const widthCm = pxToCm(widthPx, assumedDpi);
    const heightCm = pxToCm(heightPx, assumedDpi);
    const megapixels = (widthPx * heightPx) / 1_000_000;
    const dpiAtA4Width = effectiveDpi(widthPx, 21);

    const details: ImageDpiFinding[] = [
        { label: 'Pixel', value: `${widthPx} × ${heightPx}` },
        { label: 'Megapixel', value: megapixels.toFixed(2) },
        {
            label: `Druck bei ${assumedDpi} DPI`,
            value: `${widthCm.toFixed(1)} × ${heightCm.toFixed(1)} cm`,
        },
        {
            label: 'DPI bei A4-Breite (21 cm)',
            value: Number.isFinite(dpiAtA4Width) ? `${Math.round(dpiAtA4Width)} DPI` : '—',
            ok: dpiAtA4Width >= 300,
        },
    ];

    if (fileSizeBytes !== undefined) {
        details.push({ label: 'Dateigröße', value: formatFileSize(fileSizeBytes) });
    }

    const printOk = dpiAtA4Width >= 300;
    const webOk = widthPx >= 1200;

    details.push({
        label: 'Web (≥ 1200 px Breite)',
        value: webOk ? 'ausreichend' : 'eher klein',
        ok: webOk,
    });
    details.push({
        label: 'Druck (≥ 300 DPI @ A4)',
        value: printOk ? 'gut für Druck' : 'für Druck eher niedrig',
        ok: printOk,
    });

    const passport300 = {
        w: Math.round((3.5 / CM_PER_INCH) * 300),
        h: Math.round((4.5 / CM_PER_INCH) * 300),
    };
    const passportOk = widthPx >= passport300.w && heightPx >= passport300.h;
    details.push({
        label: 'Passfoto 35×45 mm @ 300 DPI',
        value: passportOk
            ? `≥ ${passport300.w}×${passport300.h} px — passt`
            : `mind. ${passport300.w}×${passport300.h} px empfohlen`,
        ok: passportOk,
    });

    const tone: ImageDpiCheckResult['tone'] =
        printOk && webOk ? 'success' : printOk || webOk ? 'warn' : 'info';
    const heading = printOk
        ? 'Auflösung für Druck und Web gut'
        : webOk
          ? 'Für Web ok — Druckauflösung prüfen'
          : 'Auflösung eher niedrig';

    return { ok: printOk || webOk, tone, heading, details };
}
