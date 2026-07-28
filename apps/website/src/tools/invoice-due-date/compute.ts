import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldDate, parseFieldNumber } from '../_shared/shells';

function formatGermanDateLong(date: Date): string {
    return date.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatGermanDateShort(date: Date): string {
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/** Rechnungsdatum + Zahlungsziel → Fälligkeitsdatum. */
export function computeInvoiceDueDate(values: FieldValues): CalcResult {
    const invoiceDate = parseFieldDate(values.invoiceDate ?? '');
    if (!invoiceDate) {
        return {
            rows: [],
            error: 'Bitte ein gültiges Rechnungsdatum wählen.',
        };
    }

    const termDays = parseFieldNumber(values.termDays ?? '');
    if (termDays === null || termDays < 0 || !Number.isInteger(termDays)) {
        return {
            rows: [],
            error: 'Bitte eine gültige Anzahl Tage eingeben (z. B. 14 oder 30).',
        };
    }

    const dueDate = addDays(invoiceDate, termDays);

    return {
        tone: 'info',
        heading: 'Fälligkeit berechnet',
        rows: [
            { label: 'Rechnungsdatum', value: formatGermanDateShort(invoiceDate) },
            { label: 'Zahlungsziel', value: `${termDays} Tage` },
            { label: 'Fällig am', value: formatGermanDateLong(dueDate) },
        ],
        hint: 'Fälligkeit = Rechnungsdatum + Zahlungsziel in Kalendertagen.',
    };
}
