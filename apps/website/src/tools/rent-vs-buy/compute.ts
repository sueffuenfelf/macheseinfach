import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL } from '../_shared/wohnen/theme';

/** Very rough rent-vs-buy cash comparison over N years (no finance advice). */
export function computeRentVsBuy(values: FieldValues): CalcResult {
    const rent = parseFieldNumber(values.rent ?? '');
    const price = parseFieldNumber(values.price ?? '');
    const years = parseFieldNumber(values.years ?? '');
    const ratePct = parseFieldNumber(values.ratePct ?? '') ?? 3.5;
    const equity = parseFieldNumber(values.equity ?? '') ?? 0;

    if (rent === null || rent < 0) {
        return { rows: [], error: 'Bitte die monatliche Warm-/Kaltmiete eingeben.' };
    }
    if (price === null || price <= 0) {
        return { rows: [], error: 'Bitte den Kaufpreis eingeben.' };
    }
    if (years === null || years <= 0) {
        return { rows: [], error: 'Bitte den Vergleichszeitraum in Jahren eingeben.' };
    }

    const months = Math.round(years * 12);
    const rentTotal = Math.round(rent * months * 100) / 100;
    const loan = Math.max(0, price - equity);
    // Simplified annuity: interest-only-ish blended cost ≈ loan * rate * years / 2 + equity opportunity ignored
    const interestApprox = Math.round(((loan * (ratePct / 100) * years) / 2) * 100) / 100;
    const buyCash = Math.round((equity + interestApprox + price * 0.1) * 100) / 100; // ~10% Kaufnebenkosten
    const delta = Math.round((buyCash - rentTotal) * 100) / 100;

    let tone: CalcResult['tone'] = 'info';
    let heading = 'Grober Cash-Vergleich';
    if (Math.abs(delta) / Math.max(rentTotal, 1) < 0.1) {
        heading = 'Ähnliche Größenordnung — Details prüfen';
    } else if (delta < 0) {
        tone = 'success';
        heading = 'Kauf-Cash (grob) niedriger als Mietsumme';
    } else {
        tone = 'warn';
        heading = 'Mietsumme (grob) günstiger als Kauf-Cash';
    }

    return {
        tone,
        heading,
        rows: [
            { label: `Miete über ${years} Jahre`, value: formatEuro(rentTotal) },
            { label: 'Kauf-Cash (grob)', value: formatEuro(buyCash) },
            { label: 'Differenz (Kauf − Miete)', value: formatEuro(delta) },
            {
                label: 'Annahmen',
                value: `Zins ~${ratePct.toLocaleString('de-DE')} % · Eigenkapital ${formatEuro(equity)} · +10 % Nebenkosten`,
            },
        ],
        hint: `Keine Finanz- oder Anlageberatung — Tilgung, Wertsteigerung und Steuern fehlen. ${DISCLAIMER_NO_LEGAL}`,
    };
}
