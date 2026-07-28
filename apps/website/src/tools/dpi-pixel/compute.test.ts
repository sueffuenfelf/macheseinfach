import { describe, expect, test } from 'bun:test';
import { computeDpiPixel } from './compute';

describe('dpi-pixel', () => {
    test('px to cm', () => {
        const result = computeDpiPixel({ mode: 'px-to-cm', a: '300', b: '300' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, String(r.value)]));
        expect(byLabel.Druckbreite).toContain('2,54');
    });

    test('cm to px', () => {
        const result = computeDpiPixel({ mode: 'cm-to-px', a: '2,54', b: '300' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, String(r.value)]));
        expect(byLabel.Pixel).toContain('300');
    });
});
