export type GermanPhoneResult = {
    raw: string;
    digits: string;
    e164: string;
    national: string;
    display: string;
};

/** Normalize a German phone number to common display formats. */
export function formatGermanPhone(raw: string): GermanPhoneResult | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    let digits = trimmed.replace(/[^\d+]/g, '');
    if (digits.startsWith('+')) {
        digits = digits.slice(1);
    }
    if (digits.startsWith('00')) {
        digits = digits.slice(2);
    }

    if (digits.startsWith('49')) {
        digits = digits.slice(2);
    } else if (digits.startsWith('0')) {
        digits = digits.slice(1);
    }

    digits = digits.replace(/\D/g, '');
    if (digits.length < 6 || digits.length > 14) return null;

    const e164 = `+49${digits}`;
    const national = `0${digits}`;
    const display = `+49 ${digits.slice(0, 3)} ${digits.slice(3)}`.trim();

    return { raw: trimmed, digits, e164, national, display };
}

/** Digits only for wa.me / sms: links (no +). */
export function phoneDigitsForLink(raw: string): string | null {
    const formatted = formatGermanPhone(raw);
    return formatted ? `49${formatted.digits}` : null;
}
