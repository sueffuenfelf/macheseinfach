import type { CalcResult, FieldValues } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';

const ONES = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'] as const;
const TEENS = [
    'zehn',
    'elf',
    'zwölf',
    'dreizehn',
    'vierzehn',
    'fünfzehn',
    'sechzehn',
    'siebzehn',
    'achtzehn',
    'neunzehn',
] as const;
const TENS = [
    '',
    'zehn',
    'zwanzig',
    'dreißig',
    'vierzig',
    'fünfzig',
    'sechzig',
    'siebzig',
    'achtzig',
    'neunzig',
] as const;

function below100(n: number): string {
    if (n < 10) return ONES[n];
    if (n < 20) return TEENS[n - 10];
    const ones = n % 10;
    const tens = Math.floor(n / 10);
    if (ones === 0) return TENS[tens];
    return `${ONES[ones]}und${TENS[tens]}`;
}

function below1000(n: number): string {
    if (n < 100) return below100(n);
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    const hundredWord = hundreds === 1 ? 'ein' : ONES[hundreds];
    if (rest === 0) return `${hundredWord}hundert`;
    return `${hundredWord}hundert${below100(rest)}`;
}

function integerToGerman(n: number): string {
    if (n === 0) return 'null';
    if (n < 1000) return below1000(n);

    const scales = [
        { value: 1_000_000_000, singular: 'Milliarde', plural: 'Milliarden' },
        { value: 1_000_000, singular: 'Million', plural: 'Millionen' },
        { value: 1_000, singular: 'tausend', plural: 'tausend' },
    ] as const;

    let remaining = n;
    const parts: string[] = [];

    for (const scale of scales) {
        if (remaining < scale.value) continue;
        const count = Math.floor(remaining / scale.value);
        remaining %= scale.value;
        const countWord = count === 1 && scale.singular !== 'tausend' ? 'ein' : below1000(count);
        const scaleWord =
            scale.singular === 'tausend'
                ? 'tausend'
                : count === 1
                  ? scale.singular
                  : scale.plural;
        parts.push(`${countWord}${scaleWord}`);
    }

    if (remaining > 0) parts.push(below1000(remaining));
    return parts.join('');
}

/** Euro-Betrag als deutschen Wortlaut (Rechnungen, Verträge). */
export function formatAmountInWordsDe(amount: number): string {
    const euros = Math.floor(Math.abs(amount));
    const cents = Math.round((Math.abs(amount) - euros) * 100);

    const euroPart = `${integerToGerman(euros)} Euro`;

    if (cents === 0) return euroPart;

    const centWord = cents === 1 ? 'Cent' : 'Cent';
    return `${euroPart} und ${integerToGerman(cents)} ${centWord}`;
}

/** Pure compute for CalcToolShell — Betrag in Worten (DE). */
export function computeAmountInWords(values: FieldValues): CalcResult {
    const amount = parseFieldNumber(values.amount ?? '');
    if (amount === null || amount < 0) {
        return {
            rows: [],
            error: 'Bitte einen gültigen Betrag eingeben (z. B. 123,45).',
        };
    }

    if (amount > 999_999_999.99) {
        return {
            rows: [],
            error: 'Betrag zu groß — maximal 999.999.999,99 EUR.',
        };
    }

    const words = formatAmountInWordsDe(amount);
    const capitalized = words.charAt(0).toUpperCase() + words.slice(1);

    return {
        tone: 'info',
        heading: 'Betrag in Worten',
        rows: [{ label: 'Ausgeschrieben', value: capitalized }],
        hint: 'Groß-/Kleinschreibung für Rechnungen ggf. anpassen — nur zur Orientierung.',
    };
}
