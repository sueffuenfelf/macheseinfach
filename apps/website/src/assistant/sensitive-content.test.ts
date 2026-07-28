import { describe, expect, test } from 'bun:test';
import { looksSensitiveContent } from './sensitive-content';

describe('looksSensitiveContent', () => {
    test('flags password-like phrases', () => {
        expect(looksSensitiveContent('Mein Passwort ist geheim')).toBe(true);
        expect(looksSensitiveContent('api_key=sk-abc123')).toBe(true);
    });

    test('ignores normal tool questions', () => {
        expect(looksSensitiveContent('Finde ein IBAN-Tool')).toBe(false);
    });
});
