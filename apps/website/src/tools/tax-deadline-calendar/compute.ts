import type { CheckResult, FieldValues } from '../_shared/shells';
import { STEUERN_DISCLAIMER, parseTaxYear, type TaxYear } from '../_shared/steuern';

type Deadline = {
    id: string;
    label: string;
    /** ISO date YYYY-MM-DD */
    due: string;
    note: string;
};

function pad(n: number): string {
    return String(n).padStart(2, '0');
}

function ustvaDeadlines(year: TaxYear, cadence: 'monthly' | 'quarterly'): Deadline[] {
    if (cadence === 'quarterly') {
        return [
            {
                id: 'q1',
                label: 'UStVA Q1',
                due: `${year}-04-10`,
                note: 'Voranmeldung Jan–März',
            },
            {
                id: 'q2',
                label: 'UStVA Q2',
                due: `${year}-07-10`,
                note: 'Voranmeldung Apr–Jun',
            },
            {
                id: 'q3',
                label: 'UStVA Q3',
                due: `${year}-10-10`,
                note: 'Voranmeldung Jul–Sep',
            },
            {
                id: 'q4',
                label: 'UStVA Q4',
                due: `${year + 1}-01-10`,
                note: 'Voranmeldung Okt–Dez',
            },
        ];
    }

    const items: Deadline[] = [];
    for (let month = 1; month <= 12; month++) {
        const dueMonth = month === 12 ? 1 : month + 1;
        const dueYear = month === 12 ? year + 1 : year;
        items.push({
            id: `m${month}`,
            label: `UStVA ${pad(month)}/${year}`,
            due: `${dueYear}-${pad(dueMonth)}-10`,
            note: `Voranmeldung für ${pad(month)}. Monat`,
        });
    }
    return items;
}

function estDeadline(year: TaxYear): Deadline {
    return {
        id: 'est',
        label: 'Einkommensteuererklärung',
        due: `${year + 1}-07-31`,
        note: `Erklärung für ${year} — ohne Steuerberater typisch 31.07.${year + 1}`,
    };
}

function formatDe(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    return `${pad(d)}.${pad(m)}.${y}`;
}

function parseIso(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function startOfDayMs(d: Date): number {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function daysUntil(from: Date, to: Date): number {
    return Math.round((startOfDayMs(to) - startOfDayMs(from)) / 86_400_000);
}

function formatLocalDate(d: Date): string {
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

/** Statische Steuerfristen (UStVA / ESt) — Orientierung, keine individuelle Frist. */
export function checkTaxDeadlines(values: FieldValues): CheckResult {
    const year = parseTaxYear(values.year);
    const cadence = (values.cadence ?? 'quarterly') as 'monthly' | 'quarterly';
    const asOfRaw = values.asOf?.trim();
    const asOf = asOfRaw ? parseIso(asOfRaw) : new Date();
    if (Number.isNaN(asOf.getTime())) {
        return {
            ok: false,
            tone: 'danger',
            heading: 'Ungültiges Datum',
            message: 'Bitte ein gültiges Stichtagsdatum wählen.',
        };
    }

    const all = [...ustvaDeadlines(year, cadence), estDeadline(year)];
    const upcoming = all
        .map((d) => ({ ...d, days: daysUntil(asOf, parseIso(d.due)) }))
        .filter((d) => d.days >= 0)
        .sort((a, b) => a.days - b.days);

    const next = upcoming[0];
    const listed = upcoming.length ? upcoming.slice(0, 6) : all.slice(-4);
    const details = listed.map((d) => {
        const daysPart =
            'days' in d && typeof d.days === 'number' ? ` (in ${d.days} Tagen)` : '';
        return {
            label: d.label,
            value: `${formatDe(d.due)}${daysPart} — ${d.note}`,
        };
    });

    if (!next) {
        return {
            ok: true,
            tone: 'info',
            heading: `Keine offenen Termine ab ${formatLocalDate(asOf)} in dieser Liste`,
            summary: `Statische Orientierung für Steuerjahr ${year}.`,
            details,
            message: `Dauerfristverlängerung und Steuerberater-Fristen nicht berücksichtigt. ${STEUERN_DISCLAIMER}`,
        };
    }

    return {
        ok: true,
        tone: next.days <= 14 ? 'warn' : 'info',
        heading: `Nächste Frist: ${next.label} am ${formatDe(next.due)}`,
        summary: `In ${next.days} Tagen · Steuerjahr ${year} · ${cadence === 'monthly' ? 'monatliche' : 'vierteljährliche'} UStVA`,
        details,
        message: `Nur Kalenderorientierung (10. des Folgemonats / Quartals). Dauerfristverlängerung & Beraterfristen fehlen. ${STEUERN_DISCLAIMER}`,
    };
}
