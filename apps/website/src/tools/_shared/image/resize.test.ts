import { describe, expect, test } from 'bun:test';
import { computeResizeDimensions } from './resize-dimensions';

describe('computeResizeDimensions', () => {
    test('returns original when no limits', () => {
        expect(computeResizeDimensions(1920, 1080)).toEqual({ width: 1920, height: 1080 });
    });

    test('scales down by max width preserving aspect ratio', () => {
        expect(computeResizeDimensions(2000, 1000, 1000)).toEqual({ width: 1000, height: 500 });
    });

    test('scales down by max height preserving aspect ratio', () => {
        expect(computeResizeDimensions(2000, 1000, undefined, 500)).toEqual({
            width: 1000,
            height: 500,
        });
    });

    test('respects both max width and height', () => {
        expect(computeResizeDimensions(4000, 3000, 2000, 1500)).toEqual({
            width: 2000,
            height: 1500,
        });
    });

    test('does not upscale', () => {
        expect(computeResizeDimensions(800, 600, 1920)).toEqual({ width: 800, height: 600 });
    });
});
