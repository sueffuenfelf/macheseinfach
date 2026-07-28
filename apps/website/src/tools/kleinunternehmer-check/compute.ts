import { formatEuro } from '../../lib/format';
import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';

/** §19 UStG Grenzen (Stand 2025/2026 — Kleinunternehmerregelung). */
export const KLEINUNTERNEHMER_PREVIOUS_YEAR_LIMIT = 25_000;
export const KLEINUNTERNEHMER_CURRENT_YEAR_LIMIT = 100_000;

type CheckStatus = 'ok' | 'warn' | 'over';

function statusFor(value: number, limit: number): CheckStatus {
    if (value > limit) return 'over';
    if (value > limit * 0.9) return 'warn';
    return 'ok';
}

function statusLabel(status: CheckStatus): string {
    if (status === 'ok') return 'Unter der Grenze';
    if (status === 'warn') return 'Grenznah';
    return 'Über der Grenze';
}

function overallTone(statuses: CheckStatus[]): CalcResult['tone'] {
    if (statuses.includes('over')) return 'danger';
    if (statuses.includes('warn')) return 'warn';
    return 'success';
}

/** Umsatz vs. §19 UStG-Grenzen — nur Hinweis, kein Steuerbescheid. */
export function computeKleinunternehmerCheck(values: FieldValues): CalcResult {
    const previousYear = parseFieldNumber(values.previousYear ?? '');
    const currentYear = parseFieldNumber(values.currentYear ?? '');

    if (previousYear === null && currentYear === null) {
        return {
            rows: [],
            error: 'Bitte mindestens einen Umsatzwert eingeben.',
        };
    }

    if (previousYear !== null && previousYear < 0) {
        return { rows: [], error: 'Vorjahresumsatz darf nicht negativ sein.' };
    }
    if (currentYear !== null && currentYear < 0) {
        return { rows: [], error: 'Umsatz laufendes Jahr darf nicht negativ sein.' };
    }

    const rows: CalcResult['rows'] = [];
    const statuses: CheckStatus[] = [];

    if (previousYear !== null) {
        const status = statusFor(previousYear, KLEINUNTERNEHMER_PREVIOUS_YEAR_LIMIT);
        statuses.push(status);
        const headroom = KLEINUNTERNEHMER_PREVIOUS_YEAR_LIMIT - previousYear;
        rows.push({
            label: 'Vorjahresumsatz',
            value: `${formatEuro(previousYear)} — ${statusLabel(status)}`,
        });
        rows.push({
            label: 'Grenze Vorjahr',
            value: formatEuro(KLEINUNTERNEHMER_PREVIOUS_YEAR_LIMIT),
        });
        if (headroom >= 0) {
            rows.push({ label: 'Spielraum Vorjahr', value: formatEuro(headroom) });
        }
    }

    if (currentYear !== null) {
        const status = statusFor(currentYear, KLEINUNTERNEHMER_CURRENT_YEAR_LIMIT);
        statuses.push(status);
        const headroom = KLEINUNTERNEHMER_CURRENT_YEAR_LIMIT - currentYear;
        rows.push({
            label: 'Umsatz laufendes Jahr',
            value: `${formatEuro(currentYear)} — ${statusLabel(status)}`,
        });
        rows.push({
            label: 'Grenze laufendes Jahr',
            value: formatEuro(KLEINUNTERNEHMER_CURRENT_YEAR_LIMIT),
        });
        if (headroom >= 0) {
            rows.push({ label: 'Spielraum laufendes Jahr', value: formatEuro(headroom) });
        }
    }

    const allOk = statuses.every((s) => s === 'ok');
    const anyOver = statuses.includes('over');

    return {
        tone: overallTone(statuses),
        heading: allOk
            ? 'Voraussichtlich unter den Grenzen'
            : anyOver
              ? 'Grenze überschritten — Steuerberater fragen'
              : 'Grenznah — genau prüfen',
        rows,
        hint: '§19 UStG Kleinunternehmerregelung (25.000\u00a0€ Vorjahr / 100.000\u00a0€ laufendes Jahr). Kein Steuerbescheid — bei Unsicherheit Steuerberater fragen.',
    };
}
