import { describe, expect, test } from 'bun:test';
import { documentMatchesFilters, parseSearchFilters } from './filters';

describe('parseSearchFilters', () => {
    test('parses kind and text tokens', () => {
        const parsed = parseSearchFilters('@tools png verkleinern');
        expect(parsed.textQuery).toBe('png verkleinern');
        expect(parsed.kinds?.has('tool')).toBe(true);
        expect(parsed.kinds?.has('variant')).toBe(true);
        expect(parsed.areaId).toBeNull();
    });

    test('parses stacked kind and area filters', () => {
        const parsed = parseSearchFilters('@tools @bilder');
        expect(parsed.textQuery).toBe('');
        expect(parsed.kinds?.has('tool')).toBe(true);
        expect(parsed.areaId).toBe('bilder');
    });

    test('parses area slug without kind', () => {
        const parsed = parseSearchFilters('@bilder heic');
        expect(parsed.textQuery).toBe('heic');
        expect(parsed.areaId).toBe('bilder');
        expect(parsed.kinds).toBeNull();
    });
});

describe('documentMatchesFilters', () => {
    const toolDoc = {
        kind: 'tool' as const,
        areaId: 'bilder' as const,
    };

    test('matches kind and area', () => {
        const filters = parseSearchFilters('@tools @bilder');
        expect(documentMatchesFilters(toolDoc, filters)).toBe(true);
        expect(documentMatchesFilters({ kind: 'area', areaId: 'bilder' }, filters)).toBe(false);
    });

    test('area-only filter includes matching tools', () => {
        const filters = parseSearchFilters('@bilder');
        expect(documentMatchesFilters({ kind: 'tool', areaId: 'bilder' }, filters)).toBe(true);
        expect(documentMatchesFilters({ kind: 'tool', areaId: 'web' }, filters)).toBe(false);
    });
});
