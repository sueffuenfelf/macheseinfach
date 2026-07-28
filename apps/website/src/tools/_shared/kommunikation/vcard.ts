export type VCardInput = {
    firstName?: string;
    lastName?: string;
    org?: string;
    title?: string;
    phone?: string;
    email?: string;
    url?: string;
};

function escapeVCard(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

/** Build a vCard 3.0 payload from contact fields. */
export function buildVCard(input: VCardInput): string {
    const first = (input.firstName ?? '').trim();
    const last = (input.lastName ?? '').trim();
    const fn = [first, last].filter(Boolean).join(' ') || 'Kontakt';
    const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escapeVCard(fn)}`, `N:${escapeVCard(last)};${escapeVCard(first)};;;`];

    if (input.org?.trim()) lines.push(`ORG:${escapeVCard(input.org.trim())}`);
    if (input.title?.trim()) lines.push(`TITLE:${escapeVCard(input.title.trim())}`);
    if (input.phone?.trim()) lines.push(`TEL;TYPE=CELL:${escapeVCard(input.phone.trim())}`);
    if (input.email?.trim()) lines.push(`EMAIL;TYPE=INTERNET:${escapeVCard(input.email.trim())}`);
    if (input.url?.trim()) lines.push(`URL:${escapeVCard(input.url.trim())}`);

    lines.push('END:VCARD');
    return lines.join('\r\n');
}
