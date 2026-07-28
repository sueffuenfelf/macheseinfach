import type { CheckResult } from '../_shared/shells';
import { checkWcagContrast } from '../_shared/color';

export function checkContrast(values: Record<string, string>): CheckResult {
    const fg = (values.fg ?? '').trim();
    const bg = (values.bg ?? '').trim();
    if (!fg || !bg) {
        return { ok: false, tone: 'warn', heading: 'Farben eingeben', message: 'Vorder- und Hintergrundfarbe angeben (#hex oder rgb).' };
    }
    const result = checkWcagContrast(fg, bg);
    if (!result) {
        return { ok: false, tone: 'danger', heading: 'Ungültige Farben', message: 'Bitte gültige Hex- (#336699) oder RGB-Werte eingeben.' };
    }
    const passAa = result.aaNormal;
    const passAaa = result.aaaNormal;
    return {
        ok: passAa,
        tone: passAaa ? 'success' : passAa ? 'info' : 'danger',
        heading: `${result.ratioLabel} Kontrast`,
        summary: passAa ? 'WCAG AA für normalen Text erfüllt' : 'WCAG AA für normalen Text nicht erfüllt',
        details: [
            { label: 'Vordergrund', value: result.fgHex },
            { label: 'Hintergrund', value: result.bgHex },
            { label: 'AA normal (4.5:1)', value: result.aaNormal ? 'Ja' : 'Nein' },
            { label: 'AA groß (3:1)', value: result.aaLarge ? 'Ja' : 'Nein' },
            { label: 'AAA normal (7:1)', value: result.aaaNormal ? 'Ja' : 'Nein' },
            { label: 'AAA groß (4.5:1)', value: result.aaaLarge ? 'Ja' : 'Nein' },
        ],
        message: 'WCAG 2.x Kontrast nach relativer Luminanz (sRGB). Große Schrift: ≥18pt normal oder ≥14pt fett.',
    };
}
