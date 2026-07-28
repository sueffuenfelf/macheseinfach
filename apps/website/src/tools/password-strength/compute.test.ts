import { describe, expect, test } from 'bun:test';
import { checkPasswordStrength } from './compute';

describe('password-strength compute', () => {
    test('empty password prompts input', () => {
        const result = checkPasswordStrength({ password: '' });
        expect(result.ok).toBe(false);
        expect(result.heading).toContain('eingeben');
    });

    test('weak common password', () => {
        const result = checkPasswordStrength({ password: 'password' });
        expect(result.ok).toBe(false);
        expect(result.details?.some((d) => String(d.value).includes('Häufiges'))).toBe(true);
    });

    test('strong password passes', () => {
        const result = checkPasswordStrength({ password: 'Xk9#mP2$vL7@nQ4!' });
        expect(result.ok).toBe(true);
        expect(result.tone).toBe('success');
    });
});
