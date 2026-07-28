import type { CheckResult, FieldValues } from '../_shared/shells';

const COMMON_PASSWORDS = new Set([
    'password',
    'passwort',
    '123456',
    '12345678',
    'qwerty',
    'abc123',
    'letmein',
    'welcome',
    'monkey',
    'dragon',
    'master',
    'login',
    'admin',
    'iloveyou',
    'sunshine',
    'princess',
    'football',
    'shadow',
    'superman',
    'hallo123',
]);

const KEYBOARD_WALKS = ['qwerty', 'asdf', 'zxcv', '1234', 'qwer', 'ytre'];

function charsetSize(password: string): number {
    let size = 0;
    if (/[a-z]/.test(password)) size += 26;
    if (/[A-Z]/.test(password)) size += 26;
    if (/\d/.test(password)) size += 10;
    if (/[^a-zA-Z0-9]/.test(password)) size += 32;
    return size;
}

function entropyBits(password: string): number {
    const size = charsetSize(password);
    if (size === 0) return 0;
    return password.length * Math.log2(size);
}

function strengthLabel(bits: number): { tone: CheckResult['tone']; label: string } {
    if (bits < 28) return { tone: 'danger', label: 'Sehr schwach' };
    if (bits < 36) return { tone: 'danger', label: 'Schwach' };
    if (bits < 60) return { tone: 'warn', label: 'Mittel' };
    if (bits < 80) return { tone: 'info', label: 'Gut' };
    return { tone: 'success', label: 'Stark' };
}

/** Local password strength check — entropy + pattern heuristics. */
export function checkPasswordStrength(values: FieldValues): CheckResult {
    const password = (values.password ?? '').trim();
    if (!password) {
        return {
            ok: false,
            tone: 'info',
            heading: 'Passwort eingeben',
            message: 'Gib ein Passwort ein, um die Stärke zu prüfen.',
        };
    }

    const bits = Math.round(entropyBits(password) * 10) / 10;
    const { tone, label } = strengthLabel(bits);
    const issues: string[] = [];

    if (password.length < 8) issues.push('Kürzer als 8 Zeichen');
    if (password.length < 12) issues.push('Unter 12 Zeichen — für wichtige Konten eher länger wählen');
    if (!/[a-z]/.test(password)) issues.push('Keine Kleinbuchstaben');
    if (!/[A-Z]/.test(password)) issues.push('Keine Großbuchstaben');
    if (!/\d/.test(password)) issues.push('Keine Ziffern');
    if (!/[^a-zA-Z0-9]/.test(password)) issues.push('Keine Sonderzeichen');
    if (/(.)\1{2,}/.test(password)) issues.push('Wiederholende Zeichen');
    if (COMMON_PASSWORDS.has(password.toLowerCase())) issues.push('Häufiges Passwort');
    const lower = password.toLowerCase();
    if (KEYBOARD_WALKS.some((walk) => lower.includes(walk))) {
        issues.push('Tastatur-Muster erkannt');
    }
    if (/^\d+$/.test(password)) issues.push('Nur Ziffern (PIN-ähnlich)');

    const ok = bits >= 60 && !COMMON_PASSWORDS.has(password.toLowerCase()) && password.length >= 12;

    return {
        ok,
        tone,
        heading: label,
        summary: `Geschätzte Entropie: ~${bits} Bit`,
        details: [
            { label: 'Länge', value: `${password.length} Zeichen` },
            { label: 'Zeichensatz', value: `${charsetSize(password)} mögliche Zeichen` },
            ...(issues.length
                ? [{ label: 'Hinweise', value: issues.join(' · ') }]
                : [{ label: 'Muster', value: 'Keine offensichtlichen Schwächen' }]),
        ],
        message: ok
            ? 'Das Passwort wirkt solide — trotzdem einzigartig pro Dienst nutzen.'
            : 'Das Passwort solltest du für wichtige Konten verbessern.',
    };
}
