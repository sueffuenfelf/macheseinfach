import { describe, expect, test } from 'bun:test';
import { generateOgPreview } from './compute';

describe('seo-og-preview', () => {
    test('generates og meta tags', () => {
        const out = generateOgPreview({
            title: 'Test',
            description: 'Beschreibung',
            image: 'https://beispiel.de/img.jpg',
            url: 'https://beispiel.de',
            type: 'article',
        });
        expect(out?.kind).toBe('code');
        if (out?.kind === 'code') {
            expect(out.content).toContain('og:title');
            expect(out.content).toContain('summary_large_image');
        }
    });
});
