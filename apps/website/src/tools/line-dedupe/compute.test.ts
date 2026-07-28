import { describe, expect, test } from 'bun:test';
import { generateLineDedupe } from './compute';

describe('line-dedupe', () => {
    test('removes duplicate lines', () => {
        const out = generateLineDedupe({
            text: 'a\nb\na\nc\nb',
            keepEmpty: 'no',
        });
        expect(out?.kind).toBe('text');
        if (out?.kind === 'text') expect(out.content).toBe('a\nb\nc');
    });

    test('keeps first occurrence order', () => {
        const out = generateLineDedupe({ text: 'x\ny\nx', keepEmpty: 'no' });
        expect(out?.kind).toBe('text');
        if (out?.kind === 'text') expect(out.content).toBe('x\ny');
    });
});
