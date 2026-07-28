import { describe, expect, test } from 'bun:test';
import { generateLoremIpsum } from './compute';

describe('lorem-ipsum', () => {
    test('generates n paragraphs', () => {
        const out = generateLoremIpsum({ paragraphs: '2', lang: 'de' });
        expect(out?.kind).toBe('text');
        if (out?.kind === 'text') {
            expect(out.content.split('\n\n')).toHaveLength(2);
            expect(out.content.toLowerCase()).toContain('blindtext');
        }
    });

    test('latin mode', () => {
        const out = generateLoremIpsum({ paragraphs: '1', lang: 'la' });
        expect(out?.kind).toBe('text');
        if (out?.kind === 'text') expect(out.content.toLowerCase()).toContain('lorem');
    });
});
