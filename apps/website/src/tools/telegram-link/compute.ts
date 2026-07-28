import type { FieldValues, GenerateOutput } from '../_shared/shells';

export function generateTelegramLink(values: FieldValues): GenerateOutput {
    const username = (values.username ?? '').trim().replace(/^@/, '');
    if (!username) return null;

    const message = (values.message ?? '').trim();
    const base = `https://t.me/${username}`;
    const url = message ? `${base}?text=${encodeURIComponent(message)}` : base;

    return { kind: 'text', content: url, filename: 'telegram-link.txt' };
}
