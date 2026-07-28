import * as OTPAuth from 'otpauth';
import type { FieldValues, GenerateOutput } from '../_shared/shells';

function normalizeSecret(raw: string): string {
    return raw.replace(/\s+/g, '').toUpperCase();
}

/** Generate a TOTP code from a shared secret — local only. */
export function generateTotp(values: FieldValues): GenerateOutput {
    const secretRaw = normalizeSecret(values.secret ?? '');
    if (!secretRaw) {
        return null;
    }

    const digits = Number(values.digits ?? '6');
    const period = Number(values.period ?? '30');
    if (![6, 8].includes(digits)) {
        return { kind: 'text', content: 'Ziffernanzahl muss 6 oder 8 sein.' };
    }
    if (![30, 60].includes(period)) {
        return { kind: 'text', content: 'Intervall muss 30 oder 60 Sekunden sein.' };
    }

    try {
        const totp = new OTPAuth.TOTP({
            secret: OTPAuth.Secret.fromBase32(secretRaw),
            digits,
            period,
        });
        const code = totp.generate();
        const remaining = period - (Math.floor(Date.now() / 1000) % period);
        return {
            kind: 'text',
            content: `${code}\n\nGültig noch ~${remaining} Sekunden (${period}s-Intervall)`,
        };
    } catch {
        return {
            kind: 'text',
            content: 'Secret ungültig — erwartet Base32 (z. B. aus Authenticator-App).',
        };
    }
}
