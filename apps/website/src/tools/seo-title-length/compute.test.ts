import { describe, expect, test } from 'bun:test';
import { computeTitleLength } from './compute';

describe('seo-title-length', () => {
    test('computes title length', () => {
        const result = computeTitleLength({ title: 'Kurzer Titel', description: '' });
        expect(result.error).toBeUndefined();
        expect(result.rows.some((r) => r.label === 'Title Zeichen' && r.value === '12')).toBe(true);
    });

    test('empty input error', () => {
        expect(computeTitleLength({ title: '', description: '' }).error).toBeTruthy();
    });
});
