import type { FieldValues, GenerateOutput } from '../_shared/shells';
import { phoneDigitsForLink } from '../_shared/kommunikation/phone';

export function generateSmsLink(values: FieldValues): GenerateOutput {
    const digits = phoneDigitsForLink(values.phone ?? '');
    if (!digits) return null;

    const message = (values.message ?? '').trim();
    const link = message ? `sms:+${digits}?body=${encodeURIComponent(message)}` : `sms:+${digits}`;

    return { kind: 'text', content: link, filename: 'sms-link.txt' };
}
