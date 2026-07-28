import type { CalcResult, FieldValues } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL } from '../_shared/wohnen/theme';

function parseIsoDate(raw: string): Date | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim());
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const date = new Date(Date.UTC(y, mo - 1, d));
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) {
        return null;
    }
    return date;
}

function formatDeDate(date: Date): string {
    return date.toLocaleDateString('de-DE', { timeZone: 'UTC' });
}

/** End of calendar month in UTC. */
function endOfMonth(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

/** Add whole months, clamped to month length. */
function addMonths(date: Date, months: number): Date {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + months;
    const day = date.getUTCDate();
    const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    return new Date(Date.UTC(y, m, Math.min(day, last)));
}

/**
 * Statutory residential notice (BGB §573c orientation):
 * - Tenant: 3 months to month end
 * - Landlord: 3 / 6 / 9 months depending on tenancy length
 */
export function computeRentNoticePeriod(values: FieldValues): CalcResult {
    const role = values.role ?? 'tenant';
    const today = parseIsoDate(values.today ?? '') ?? new Date();
    // normalize today to UTC date-only if from Date()
    const noticeDay =
        values.today && parseIsoDate(values.today)
            ? parseIsoDate(values.today)!
            : new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    const start = parseIsoDate(values.start ?? '');
    if (!start) {
        return { rows: [], error: 'Bitte das Mietbeginn-Datum angeben (JJJJ-MM-TT).' };
    }
    if (start > noticeDay) {
        return { rows: [], error: 'Mietbeginn liegt nach dem Kündigungsdatum.' };
    }

    const years =
        (noticeDay.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

    let monthsNotice: number;
    let basis: string;

    if (role === 'tenant') {
        monthsNotice = 3;
        basis = 'Mieter · gesetzliche Frist ca. 3 Monate zum Monatsende (§573c BGB, Orientierung)';
    } else {
        if (years < 5) {
            monthsNotice = 3;
            basis = 'Vermieter · unter 5 Jahren Mietdauer · ca. 3 Monate';
        } else if (years < 8) {
            monthsNotice = 6;
            basis = 'Vermieter · 5–8 Jahre Mietdauer · ca. 6 Monate';
        } else {
            monthsNotice = 9;
            basis = 'Vermieter · ab 8 Jahren Mietdauer · ca. 9 Monate';
        }
    }

    // Notice must arrive by the 3rd working day of a month for that month to count —
    // we approximate: deadline = end of month after (monthsNotice) from notice day,
    // requiring receipt by start of that window. Practical: earliest end = EOM of month
    // that is monthsNotice months after the month of receipt.
    const receiptMonthStart = new Date(
        Date.UTC(noticeDay.getUTCFullYear(), noticeDay.getUTCMonth(), 1),
    );
    // If notice arrives after day 3, first full month is next month (conservative).
    const day = noticeDay.getUTCDate();
    const firstCountedMonth =
        day <= 3
            ? receiptMonthStart
            : new Date(Date.UTC(noticeDay.getUTCFullYear(), noticeDay.getUTCMonth() + 1, 1));

    const endMonth = addMonths(firstCountedMonth, monthsNotice - 1);
    const termination = endOfMonth(endMonth);

    const tenancyLabel =
        years < 1
            ? `${Math.round(years * 12)} Monate`
            : `${years.toFixed(1).replace('.', ',')} Jahre`;

    return {
        tone: 'info',
        heading: 'Frühestes Vertragsende (Orientierung)',
        rows: [
            { label: 'Kündigung eingereicht am', value: formatDeDate(noticeDay) },
            { label: 'Mietdauer bisher', value: tenancyLabel },
            { label: 'Frist (Monate)', value: String(monthsNotice) },
            { label: 'Frühestes Ende', value: formatDeDate(termination) },
        ],
        hint: `${basis}. ${DISCLAIMER_NO_LEGAL}`,
    };
}
