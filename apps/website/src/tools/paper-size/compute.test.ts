import { describe, expect, test } from 'bun:test';
import { checkPaperSize } from './compute';

describe('paper-size', () => {
    test('shows A4 standard dimensions', () => {
        const result = checkPaperSize({ format: 'A4', dpi: '300', width: '', height: '' });
        expect(result.ok).toBe(true);
        expect(result.heading).toContain('A4');
        expect(result.summary).toContain('2.480');
    });

    test('matches custom A4 dimensions', () => {
        const result = checkPaperSize({
            format: 'A4',
            dpi: '300',
            width: '210',
            height: '297',
        });
        expect(result.ok).toBe(true);
        expect(result.heading).toContain('bestätigt');
    });
});
