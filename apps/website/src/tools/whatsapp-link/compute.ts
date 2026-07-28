import type { FieldValues, GenerateOutput } from '../_shared/shells';
import { phoneDigitsForLink } from '../_shared/kommunikation/phone';

export function generateWhatsappLink(values: FieldValues): GenerateOutput {
    const digits = phoneDigitsForLink(values.phone ?? '');
    if (!digits) return null;

    const message = (values.message ?? '').trim();
    const base = `https://wa.me/${digits}`;
    const url = message ? `${base}?text=${encodeURIComponent(message)}` : base;

    return {
        kind: 'text',
        content: url,
        filename: 'whatsapp-link.txt',
    };
}
