/** Dated German tax orientation constants — document year in UI. Not legal advice. */

export type TaxYear = 2025 | 2026;

export const HOMEOFFICE_EUR_PER_DAY = 6;
export const HOMEOFFICE_MAX_DAYS = 210;
export const HOMEOFFICE_MAX_EUR = HOMEOFFICE_EUR_PER_DAY * HOMEOFFICE_MAX_DAYS;

/** Entfernungspauschale (Pendeln) — einfache Strecke. */
export function commuteRate(year: TaxYear, km: number): { rate: number; label: string } {
    if (year >= 2026) {
        return { rate: 0.38, label: '0,38\u00a0€/km ab 1. km (2026)' };
    }
    if (km <= 20) {
        return { rate: 0.3, label: '0,30\u00a0€/km (1.–20. km, 2025)' };
    }
    return { rate: 0.38, label: '0,38\u00a0€/km ab 21. km (2025)' };
}

/** Annual commute allowance for simple distance km × workdays. */
export function commuteAnnual(year: TaxYear, km: number, workdays: number): number {
    const distance = Math.floor(km);
    if (distance <= 0 || workdays <= 0) return 0;
    if (year >= 2026) {
        return roundCents(distance * 0.38 * workdays);
    }
    const first = Math.min(distance, 20);
    const rest = Math.max(0, distance - 20);
    return roundCents((first * 0.3 + rest * 0.38) * workdays);
}

/** Dienstreise / betrieblich genutzter Pkw — Pauschbetrag. */
export const MILEAGE_EUR_PER_KM = 0.3;

/** Gewerbesteuer-Steuermesszahl. */
export const TRADE_TAX_MESSZAHL = 0.035;
/** Freibetrag Einzelunternehmen / Personengesellschaften. */
export const TRADE_TAX_ALLOWANCE = 24_500;

/** Solidaritätszuschlag Freigrenze (festgesetzte ESt). */
export function soliFreigrenze(
    year: TaxYear,
    filing: 'single' | 'joint',
): number {
    if (year >= 2026) {
        return filing === 'joint' ? 40_700 : 20_350;
    }
    return filing === 'joint' ? 39_900 : 19_950;
}

export const SOLI_RATE = 0.055;

/** Kindergeld monatlich pro Kind. */
export function childBenefitMonthly(year: TaxYear): number {
    return year >= 2026 ? 259 : 255;
}

export function roundCents(n: number): number {
    return Math.round(n * 100) / 100;
}

export function parseTaxYear(raw: string | undefined): TaxYear {
    return raw === '2025' ? 2025 : 2026;
}
