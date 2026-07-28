import type { FieldValues, GenerateOutput } from '../_shared/shells';
import { formatGermanPhone } from '../_shared/kommunikation/phone';

export function generatePhoneFormatDe(values: FieldValues): GenerateOutput {
    const formatted = formatGermanPhone(values.phone ?? '');
    if (!formatted) return null;

    const lines = [
        'Telefonnummer formatiert',
        '—',
        `Eingabe:     ${formatted.raw}`,
        `National:    ${formatted.national}`,
        `International: ${formatted.e164}`,
        `Anzeige:     ${formatted.display}`,
        `Nur Ziffern: ${formatted.digits} (ohne Ländervorwahl)`,
        '',
        'Für wa.me/sms: 49' + formatted.digits,
    ];

    return { kind: 'text', content: lines.join('\n'), filename: 'telefon-format.txt' };
}
