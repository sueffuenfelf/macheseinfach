import { describe, expect, test } from 'bun:test';
import { PASSPORT_HINTS, checkIdPhoto } from './compute';

describe('checkIdPhoto', () => {
    test('accepts typical 413×531 photo under 2 MB', () => {
        const result = checkIdPhoto({
            widthPx: 413,
            heightPx: 531,
            bytes: 180_000,
            mime: 'image/jpeg',
        });
        expect(result.ok).toBe(true);
        expect(result.tone).toBe('success');
    });

    test('flags landscape', () => {
        const result = checkIdPhoto({
            widthPx: 531,
            heightPx: 413,
            bytes: 100_000,
        });
        expect(result.ok).toBe(false);
        expect(result.message).toContain('Hochformat');
    });

    test('flags oversized file', () => {
        const result = checkIdPhoto({
            widthPx: 413,
            heightPx: 531,
            bytes: PASSPORT_HINTS.maxBytes + 1,
        });
        expect(result.ok).toBe(false);
        expect(result.message).toContain('groß');
    });

    test('empty dims', () => {
        const result = checkIdPhoto({ widthPx: 0, heightPx: 0, bytes: 0 });
        expect(result.ok).toBe(false);
        expect(result.tone).toBe('danger');
    });
});
