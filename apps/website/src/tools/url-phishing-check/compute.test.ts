import { describe, expect, test } from 'bun:test';
import { checkUrlPhishing } from './compute';

describe('url-phishing-check compute', () => {
    test('empty url', () => {
        const result = checkUrlPhishing({ url: '' });
        expect(result.ok).toBe(false);
    });

    test('clean https url', () => {
        const result = checkUrlPhishing({ url: 'https://beispiel.de/pfad' });
        expect(result.ok).toBe(true);
        expect(result.tone).toBe('success');
    });

    test('idn punycode warns', () => {
        const result = checkUrlPhishing({ url: 'https://xn--bcher-kva.example' });
        expect(result.ok).toBe(false);
        expect(result.details?.some((d) => String(d.value).includes('Punycode'))).toBe(true);
    });

    test('http warns', () => {
        const result = checkUrlPhishing({ url: 'http://beispiel.de' });
        expect(result.ok).toBe(false);
    });
});
