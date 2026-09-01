import { describe, expect, test } from 'bun:test';
import { clampSplit } from './ImageDisplayCompareSlider';

describe('clampSplit', () => {
    test('keeps the handle inside the frame', () => {
        expect(clampSplit(0)).toBe(8);
        expect(clampSplit(50)).toBe(50);
        expect(clampSplit(100)).toBe(92);
    });
});
