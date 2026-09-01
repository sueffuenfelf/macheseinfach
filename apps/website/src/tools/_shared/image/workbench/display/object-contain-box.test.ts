import { describe, expect, test } from 'bun:test';
import { objectContainBox } from './object-contain-box';

describe('objectContainBox', () => {
    test('letterboxes a landscape image in a tall frame', () => {
        const box = objectContainBox(200, 100, 200, 200);
        expect(box.w).toBe(200);
        expect(box.h).toBe(100);
        expect(box.x).toBe(0);
        expect(box.y).toBe(50);
    });
});
