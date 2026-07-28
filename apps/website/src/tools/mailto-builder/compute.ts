import type { FieldValues, GenerateOutput } from '../_shared/shells';

export function generateMailtoLink(values: FieldValues): GenerateOutput {
    const email = (values.email ?? '').trim();
    if (!email || !email.includes('@')) return null;

    const subject = (values.subject ?? '').trim();
    const body = (values.body ?? '').trim();

    const params = new URLSearchParams();
    if (subject) params.set('subject', subject);
    if (body) params.set('body', body);
    const query = params.toString();
    const link = query ? `mailto:${email}?${query}` : `mailto:${email}`;

    return { kind: 'text', content: link, filename: 'mailto-link.txt' };
}
