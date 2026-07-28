import type { ExtractField } from '../_shared/shells';

const EMAIL_RE = /[\w.+-]+@[\w.-]+\.\w{2,}/g;
const PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g;
const IBAN_RE = /\b[A-Z]{2}\d{2}[A-Z0-9 ]{11,30}\b/g;
/** Simple “Vorname Nachname” pattern — two capitalized words. */
const NAME_RE = /\b[A-ZÄÖÜ][a-zäöüß]+ [A-ZÄÖÜ][a-zäöüß]+\b/g;
const NOT_NAME_PHRASES = new Set([
    'Hallo Welt',
    'Guten Tag',
    'Sehr geehrte',
    'Mit freundlichen',
    'Freundliche Grüße',
]);

function maskNamePhrase(match: string): string | null {
    if (NOT_NAME_PHRASES.has(match)) return null;
    const [first] = match.split(' ');
    const skipFirst = new Set(['Hallo', 'Guten', 'Sehr', 'Liebe', 'Kontakt', 'Von', 'Mit']);
    if (skipFirst.has(first)) return null;
    return match
        .split(' ')
        .map((part) => maskMatch(part, 1, 0))
        .join(' ');
}

function maskMatch(match: string, keepStart = 2, keepEnd = 1): string {
    if (match.length <= keepStart + keepEnd) return '*'.repeat(match.length);
    const end = keepEnd > 0 ? match.slice(-keepEnd) : '';
    return (
        match.slice(0, keepStart) +
        '*'.repeat(Math.max(1, match.length - keepStart - keepEnd)) +
        end
    );
}

function redactText(text: string): { output: string; counts: Record<string, number> } {
    const counts = { emails: 0, phones: 0, ibans: 0, names: 0 };

    let output = text.replace(EMAIL_RE, (m) => {
        counts.emails++;
        const [local, domain] = m.split('@');
        return `${maskMatch(local ?? '', 1, 0)}@${domain}`;
    });

    output = output.replace(IBAN_RE, (m) => {
        counts.ibans++;
        return maskMatch(m.replace(/\s/g, ''), 4, 4);
    });

    output = output.replace(PHONE_RE, (m) => {
        counts.phones++;
        return maskMatch(m.replace(/\D/g, ''), 2, 2);
    });

    output = output.replace(NAME_RE, (m) => {
        const masked = maskNamePhrase(m);
        if (!masked) return m;
        counts.names++;
        return masked;
    });

    return { output, counts };
}

/** Mask emails, phones, IBANs and name-like patterns in pasted text. */
export function extractRedactedText(input: {
    text?: string;
    file?: File;
}): Promise<ExtractField[]> {
    const text = input.text?.trim();
    if (!text) {
        throw new Error('Bitte Text zum Schwärzen einfügen.');
    }

    const { output, counts } = redactText(text);
    const total = counts.emails + counts.phones + counts.ibans + counts.names;

    return Promise.resolve([
        {
            id: 'redacted',
            label: 'Geschwärzter Text',
            value: output,
            mono: true,
        },
        {
            id: 'stats',
            label: 'Ersetzt',
            value: `${total} Treffer (E-Mail: ${counts.emails}, Telefon: ${counts.phones}, IBAN: ${counts.ibans}, Namen: ${counts.names})`,
        },
    ]);
}

export { redactText };
