import { describe, expect, test } from 'bun:test';
import { generateMetaPreview } from './compute';

describe('seo-meta-preview', () => {
    test('generates snippet with title and description', () => {
        const out = generateMetaPreview({
            title: 'Handwerker Berlin',
            description: 'Zuverlässige Renovierung in Berlin.',
            url: 'https://beispiel.de/handwerker',
        });
        expect(out?.kind).toBe('text');
        if (out?.kind === 'text') {
            expect(out.content).toContain('Handwerker Berlin');
            expect(out.content).toContain('beispiel.de/handwerker');
        }
    });

    test('returns null when empty', () => {
        expect(generateMetaPreview({ title: '', description: '' })).toBeNull();
    });
});
