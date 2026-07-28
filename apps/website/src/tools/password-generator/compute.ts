import {
    buildPasswordCharset,
    generatePassword,
    type PasswordCharsetOptions,
} from '../../shell/commands/utils';
import type { FieldValues, GenerateOutput } from '../_shared/shells';
import { parseFieldNumber } from '../_shared/shells';

function charsetFromPreset(preset: string): PasswordCharsetOptions {
    switch (preset) {
        case 'letters-numbers':
            return { uppercase: true, lowercase: true, numbers: true, symbols: false };
        case 'letters-only':
            return { uppercase: true, lowercase: true, numbers: false, symbols: false };
        case 'pin':
            return { uppercase: false, lowercase: false, numbers: true, symbols: false };
        default:
            return { uppercase: true, lowercase: true, numbers: true, symbols: true };
    }
}

/** Generate a cryptographically random password. */
export function generateSecurePassword(values: FieldValues): GenerateOutput {
    const length = parseFieldNumber(values.length ?? '') ?? 20;
    if (length < 4 || length > 128) {
        return { kind: 'text', content: 'Länge muss zwischen 4 und 128 liegen.' };
    }

    const preset = values.preset ?? 'strong';
    const charset = charsetFromPreset(preset);
    const chars = buildPasswordCharset(charset);
    if (!chars) {
        return { kind: 'text', content: 'Zeichensatz ist leer — bitte andere Option wählen.' };
    }

    const password = generatePassword(length, charset);
    return { kind: 'text', content: password };
}
