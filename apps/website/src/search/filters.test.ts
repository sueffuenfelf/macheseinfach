import { describe, expect, test } from 'bun:test';
import { documentMatchesFilters, parseSearchFilters } from './filters';
import type { SearchDocument } from './types';

describe('parseSearchFilters', () => {
    test('parses kind and text tokens', () => {
        const parsed = parseSearchFilters('@tools png verkleinern');
        expect(parsed.textQuery).toBe('png verkleinern');
        expect(parsed.kinds?.has('tool')).toBe(true);
        expect(parsed.kinds?.has('variant')).toBe(true);
        expect(parsed.areaId).toBeNull();
    });

    test('parses stacked kind and area filters', () => {
        const parsed = parseSearchFilters('@tools @buchhaltung');
        expect(parsed.textQuery).toBe('');
        expect(parsed.kinds?.has('tool')).toBe(true);
        expect(parsed.areaId).toBe('buchhaltung');
    });

    test('parses vorhaben filter', () => {
        const parsed = parseSearchFilters('@vorhaben miete');
        expect(parsed.textQuery).toBe('miete');
        expect(parsed.kinds?.has('story')).toBe(true);
        expect(parsed.kinds?.has('tool')).toBe(false);
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
        areaId: 'buchhaltung' as const,
    };

    test('matches kind and area', () => {
        const filters = parseSearchFilters('@tools @buchhaltung');
        expect(documentMatchesFilters(toolDoc, filters)).toBe(true);
        expect(
            documentMatchesFilters({ kind: 'story', areaId: 'buchhaltung' }, filters),
        ).toBe(false);
    });

    test('area-only filter includes matching tools', () => {
        const filters = parseSearchFilters('@bilder');
        expect(documentMatchesFilters({ kind: 'tool', areaId: 'bilder' }, filters)).toBe(true);
        expect(documentMatchesFilters({ kind: 'tool', areaId: 'buchhaltung' }, filters)).toBe(
            false,
        );
    });
});
