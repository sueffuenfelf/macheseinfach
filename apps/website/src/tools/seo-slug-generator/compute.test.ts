import { describe, expect, test } from 'bun:test';
import { titleToSlug } from '../_shared/seo/slug';
import { generateSlug } from './compute';

describe('seo-slug-generator', () => {
    test('umlauts converted', () => {
        expect(titleToSlug('Über uns')).toBe('ueber-uns');
        expect(titleToSlug('Größe & Maße')).toBe('groesse-masse');
    });

    test('generate output', () => {
        const out = generateSlug({ title: 'Handwerker Berlin' });
        expect(out?.kind).toBe('text');
        if (out?.kind === 'text') expect(out.content).toContain('handwerker-berlin');
    });
});
