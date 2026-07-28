import { describe, expect, test } from 'bun:test';
import { computeKeywordDensity } from './compute';

describe('seo-keyword-density', () => {
    test('counts single keyword', () => {
        const result = computeKeywordDensity({
            text: 'Berlin ist schön. Berlin lebt.',
            keyword: 'berlin',
        });
        expect(result.rows.find((r) => r.label === 'Vorkommen')?.value).toBe('2');
    });

    test('missing keyword error', () => {
        expect(computeKeywordDensity({ text: 'Hallo', keyword: '' }).error).toBeTruthy();
    });
});
