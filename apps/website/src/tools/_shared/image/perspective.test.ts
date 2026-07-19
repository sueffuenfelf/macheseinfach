import { describe, expect, test } from 'bun:test';
import {
    applyHomography,
    isConvexQuad,
    type Quad,
    quadNaturalSize,
    rectToQuad,
    solveHomography,
} from './perspective';

const UNIT: Quad = rectToQuad(1, 1);

function expectPointClose(actual: { x: number; y: number }, expected: { x: number; y: number }) {
    expect(actual.x).toBeCloseTo(expected.x, 6);
    expect(actual.y).toBeCloseTo(expected.y, 6);
}

describe('solveHomography', () => {
    test('maps identical quads to the identity mapping', () => {
        const h = solveHomography(UNIT, UNIT);
        expect(h).not.toBeNull();
        expectPointClose(applyHomography(h as number[], { x: 0.25, y: 0.75 }), {
            x: 0.25,
            y: 0.75,
        });
    });

    test('maps each source corner onto its target corner', () => {
        const source = rectToQuad(400, 300);
        const target: Quad = [
            { x: 20, y: 10 },
            { x: 380, y: 60 },
            { x: 350, y: 290 },
            { x: 5, y: 250 },
        ];
        const h = solveHomography(source, target);
        expect(h).not.toBeNull();
        for (let i = 0; i < 4; i += 1) {
            expectPointClose(applyHomography(h as number[], source[i]), target[i]);
        }
    });

    test('round-trips through the inverse mapping', () => {
        const source = rectToQuad(200, 100);
        const target: Quad = [
            { x: 10, y: 0 },
            { x: 190, y: 25 },
            { x: 160, y: 95 },
            { x: 0, y: 80 },
        ];
        const forward = solveHomography(source, target) as number[];
        const backward = solveHomography(target, source) as number[];

        const probe = { x: 73, y: 41 };
        expectPointClose(applyHomography(backward, applyHomography(forward, probe)), probe);
    });

    test('represents a pure scale as a linear mapping', () => {
        const h = solveHomography(rectToQuad(100, 50), rectToQuad(200, 100)) as number[];
        expectPointClose(applyHomography(h, { x: 50, y: 25 }), { x: 100, y: 50 });
    });

    test('returns null for a degenerate quad', () => {
        const collapsed: Quad = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        expect(solveHomography(rectToQuad(10, 10), collapsed)).toBeNull();
    });
});

describe('isConvexQuad', () => {
    test('accepts a rectangle', () => {
        expect(isConvexQuad(rectToQuad(100, 60))).toBe(true);
    });

    test('accepts a trapezoid', () => {
        expect(
            isConvexQuad([
                { x: 20, y: 0 },
                { x: 80, y: 0 },
                { x: 100, y: 60 },
                { x: 0, y: 60 },
            ]),
        ).toBe(true);
    });

    test('rejects a self-intersecting quad', () => {
        expect(
            isConvexQuad([
                { x: 0, y: 0 },
                { x: 100, y: 100 },
                { x: 100, y: 0 },
                { x: 0, y: 100 },
            ]),
        ).toBe(false);
    });

    test('rejects a quad with three collinear corners', () => {
        expect(
            isConvexQuad([
                { x: 0, y: 0 },
                { x: 50, y: 0 },
                { x: 100, y: 0 },
                { x: 0, y: 100 },
            ]),
        ).toBe(false);
    });
});

describe('quadNaturalSize', () => {
    test('returns the side lengths of an axis-aligned rectangle', () => {
        expect(quadNaturalSize(rectToQuad(200, 80))).toEqual({ width: 200, height: 80 });
    });

    test('takes the longer of each pair of opposite edges', () => {
        // Oben 60 breit, unten 100 breit — 100 gewinnt, damit nichts gestaucht wird.
        const trapezoid: Quad = [
            { x: 20, y: 0 },
            { x: 80, y: 0 },
            { x: 100, y: 50 },
            { x: 0, y: 50 },
        ];
        expect(quadNaturalSize(trapezoid).width).toBeCloseTo(100, 6);
    });

    test('measures rotated edges by their true length', () => {
        const rotated: Quad = [
            { x: 0, y: 0 },
            { x: 30, y: 40 },
            { x: 10, y: 55 },
            { x: -20, y: 15 },
        ];
        expect(quadNaturalSize(rotated).width).toBeCloseTo(50, 6);
        expect(quadNaturalSize(rotated).height).toBeCloseTo(25, 6);
    });
});
