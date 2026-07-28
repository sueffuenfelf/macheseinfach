import { describe, expect, test } from 'bun:test';
import {
    addRotateDegrees,
    allPageIndices,
    moveIndex,
    normalizePageOrder,
    normalizeRotateDegrees,
    parsePageSpec,
} from './pages';
import { fitRect } from './geometry';

describe('parsePageSpec', () => {
    test('parses singles and ranges', () => {
        expect(parsePageSpec('1,3,5-7', 10)).toEqual([0, 2, 4, 5, 6]);
    });

    test('ignores out-of-range and dedupes', () => {
        expect(parsePageSpec('1,1,99,2-3', 5)).toEqual([0, 1, 2]);
    });

    test('handles reversed ranges and whitespace', () => {
        expect(parsePageSpec(' 4 - 2 ; 1 ', 4)).toEqual([0, 1, 2, 3]);
    });

    test('empty / invalid returns []', () => {
        expect(parsePageSpec('', 5)).toEqual([]);
        expect(parsePageSpec('abc', 5)).toEqual([]);
    });
});

describe('normalizePageOrder', () => {
    test('accepts permutation', () => {
        expect(normalizePageOrder([2, 0, 1], 3)).toEqual([2, 0, 1]);
    });

    test('rejects duplicates / wrong length', () => {
        expect(normalizePageOrder([0, 0, 1], 3)).toEqual([0, 1, 2]);
        expect(normalizePageOrder([0, 1], 3)).toEqual([0, 1, 2]);
    });
});

describe('rotate helpers', () => {
    test('normalizeRotateDegrees', () => {
        expect(normalizeRotateDegrees(90)).toBe(90);
        expect(normalizeRotateDegrees(450)).toBe(90);
        expect(normalizeRotateDegrees(-90)).toBe(270);
    });

    test('addRotateDegrees', () => {
        expect(addRotateDegrees(90, 180)).toBe(270);
        expect(addRotateDegrees(270, 90)).toBe(0);
    });
});

describe('moveIndex / allPageIndices', () => {
    test('moves items', () => {
        expect(moveIndex(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    });

    test('allPageIndices', () => {
        expect(allPageIndices(3)).toEqual([0, 1, 2]);
        expect(allPageIndices(0)).toEqual([]);
    });
});

describe('fitRect', () => {
    test('contain centers and preserves aspect', () => {
        const r = fitRect(200, 100, 100, 100, 'contain');
        expect(r.width).toBeCloseTo(100);
        expect(r.height).toBeCloseTo(50);
        expect(r.x).toBeCloseTo(0);
        expect(r.y).toBeCloseTo(25);
    });

    test('stretch fills dest', () => {
        expect(fitRect(10, 10, 100, 50, 'stretch')).toEqual({
            x: 0,
            y: 0,
            width: 100,
            height: 50,
        });
    });
});
