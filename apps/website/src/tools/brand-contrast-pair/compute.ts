import type { CheckResult } from '../_shared/shells';
import { checkWcagContrast } from '../_shared/color';

export function checkBrandContrast(values: Record<string, string>): CheckResult {
    const brand = (values.brand ?? '').trim();
    const text = (values.text ?? '#ffffff').trim();
    if (!brand) {
        return { ok: false, tone: 'warn', heading: 'Markenfarbe fehlt', message: 'Logo- oder Markenfarbe eingeben.' };
    }
    const result = checkWcagContrast(text, brand);
    if (!result) {
        return { ok: false, tone: 'danger', heading: 'Ungültige Farben', message: 'Hex oder rgb() verwenden.' };
    }
    return {
        ok: result.aaLarge,
        tone: result.aaNormal ? 'success' : result.aaLarge ? 'info' : 'danger',
        heading: `Marken-Hintergrund ${result.ratioLabel}`,
        summary: result.aaNormal
            ? 'Text auf Markenfarbe: WCAG AA OK'
            : result.aaLarge
              ? 'Nur für große Schrift OK — normalen Text prüfen'
              : 'Kontrast zu niedrig für Text auf Markenfarbe',
        details: [
            { label: 'Text', value: result.fgHex },
            { label: 'Marke (Hintergrund)', value: result.bgHex },
            { label: 'AA normal', value: result.aaNormal ? 'Ja' : 'Nein' },
            { label: 'AA groß', value: result.aaLarge ? 'Ja' : 'Nein' },
        ],
    };
}
