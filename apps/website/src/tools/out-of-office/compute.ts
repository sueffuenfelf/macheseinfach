import type { FieldValues, GenerateOutput } from '../_shared/shells';

const TEMPLATES = {
    de: (from: string, until: string, contact: string, reason: string) =>
        [
            'Abwesenheitsnotiz (DE)',
            '—',
            `Vielen Dank für Ihre Nachricht.`,
            '',
            reason
                ? `Ich bin ${from ? `vom ${from} ` : ''}${until ? `bis ${until} ` : ''}abwesend. ${reason}`
                : `Ich bin ${from ? `vom ${from} ` : ''}${until ? `bis ${until} ` : ''}nicht erreichbar.`,
            '',
            contact
                ? `In dringenden Fällen wenden Sie sich bitte an: ${contact}`
                : 'E-Mails werden nach meiner Rückkehr bearbeitet.',
            '',
            'Mit freundlichen Grüßen',
        ].join('\n'),
    en: (from: string, until: string, contact: string, reason: string) =>
        [
            'Out of Office (EN)',
            '—',
            'Thank you for your message.',
            '',
            reason
                ? `I am out of office ${from ? `from ${from} ` : ''}${until ? `until ${until}. ` : ''}${reason}`
                : `I am out of office ${from ? `from ${from} ` : ''}${until ? `until ${until}. ` : ''}I will respond when I return.`,
            '',
            contact ? `For urgent matters, please contact: ${contact}` : 'I will reply to your email upon my return.',
            '',
            'Best regards',
        ].join('\n'),
};

export function generateOutOfOffice(values: FieldValues): GenerateOutput {
    const lang = values.lang ?? 'de';
    const from = (values.fromDate ?? '').trim();
    const until = (values.untilDate ?? '').trim();
    const contact = (values.contact ?? '').trim();
    const reason = (values.reason ?? '').trim();

    const content = lang === 'en' ? TEMPLATES.en(from, until, contact, reason) : TEMPLATES.de(from, until, contact, reason);

    return {
        kind: 'text',
        content,
        filename: lang === 'en' ? 'out-of-office-en.txt' : 'abwesenheitsnotiz-de.txt',
    };
}
