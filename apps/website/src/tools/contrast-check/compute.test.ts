import { describe, expect, test } from 'bun:test';
import { checkContrast } from './compute';

describe('contrast-check', () => {
    test('passes black on white', () => {
        const r = checkContrast({ fg: '#000', bg: '#fff' });
        expect(r.ok).toBe(true);
    });
});
