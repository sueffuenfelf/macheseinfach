import type { CheckResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import {
    A_SERIES_MM,
    fmtUnit,
    matchPaperFormat,
    paperPxAtDpi,
    type PaperFormat,
} from '../_shared/units';

export function checkPaperSize(values: FieldValues): CheckResult {
    const format = (values.format ?? 'A4') as PaperFormat;
    const dpi = parseFieldNumber(values.dpi ?? '300') ?? 300;
    const widthInput = parseFieldNumber(values.width ?? '');
    const heightInput = parseFieldNumber(values.height ?? '');

    const spec = A_SERIES_MM[format];
    if (!spec) {
        return {
            ok: false,
            tone: 'danger',
            heading: 'Unbekanntes Format',
            message: 'Bitte ein gültiges Papierformat wählen.',
        };
    }

    const pxW = paperPxAtDpi(spec.width, dpi);
    const pxH = paperPxAtDpi(spec.height, dpi);

    const details = [
        { label: 'Breite', value: `${spec.width} mm (${fmtUnit(pxW, 0)} px)` },
        { label: 'Höhe', value: `${spec.height} mm (${fmtUnit(pxH, 0)} px)` },
        { label: 'DPI', value: `${fmtUnit(dpi, 0)}` },
    ];

    if (widthInput === null && heightInput === null) {
        return {
            ok: true,
            tone: 'info',
            heading: `${format}: ${spec.width} × ${spec.height} mm`,
            summary: `Bei ${fmtUnit(dpi, 0)} DPI: ${fmtUnit(pxW, 0)} × ${fmtUnit(pxH, 0)} px`,
            details,
            message: 'Standardmaße nach ISO 216 (Hochformat).',
        };
    }

    if (widthInput === null || heightInput === null) {
        return {
            ok: false,
            tone: 'warn',
            heading: 'Beide Maße angeben',
            message: 'Für den Abgleich Breite und Höhe in mm eingeben — oder leer lassen für Standardmaße.',
        };
    }

    const matched = matchPaperFormat(widthInput, heightInput);
    const matchesSelected = matched === format;

    return {
        ok: matchesSelected,
        tone: matchesSelected ? 'success' : 'warn',
        heading: matchesSelected
            ? `${format} bestätigt`
            : matched
              ? `Entspricht ${matched}, nicht ${format}`
              : 'Kein Standardformat',
        summary: `Eingabe: ${widthInput} × ${heightInput} mm`,
        details: [
            ...details,
            {
                label: 'Abgleich',
                value: matched ?? 'Kein ISO-A-Format (±1 mm)',
            },
        ],
        message: matchesSelected
            ? 'Die eingegebenen Maße passen zum gewählten Format.'
            : matched
              ? `Die Maße entsprechen eher ${matched}.`
              : 'Die Maße weichen von allen gängigen A-Formaten ab.',
    };
}
