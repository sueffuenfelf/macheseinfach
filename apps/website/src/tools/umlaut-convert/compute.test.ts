import { describe, expect, test } from 'bun:test';
import { generateUmlautConvert } from './compute';

describe('umlaut-convert', () => {
    test('to ascii', () => {
        const out = generateUmlautConvert({ text: 'Größe Maß', direction: 'to-ascii' });
        expect(out?.kind).toBe('text');
        if (out?.kind === 'text') expect(out.content).toBe('Groesse Mass');
    });

    test('from ascii', () => {
        const out = generateUmlautConvert({ text: 'Groesse', direction: 'from-ascii' });
        expect(out?.kind).toBe('text');
        if (out?.kind === 'text') expect(out.content).toBe('Größe');
    });
});
