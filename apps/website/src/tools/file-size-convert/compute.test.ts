import { describe, expect, test } from 'bun:test';
import { computeFileSizeConvert } from './compute';

describe('file-size-convert', () => {
    test('KB to MB', () => {
        const result = computeFileSizeConvert({ value: '1024', from: 'KB', to: 'MB' });
        const byLabel = Object.fromEntries(result.rows.map((r) => [r.label, String(r.value)]));
        expect(byLabel.Ergebnis).toContain('1');
        expect(byLabel.Ergebnis).toContain('MB');
    });
});
