import { describe, expect, test } from 'bun:test';
import { generateSchema } from './compute';

describe('seo-schema-generator', () => {
    test('local business json', () => {
        const out = generateSchema({
            schemaType: 'local-business',
            name: 'Test GmbH',
            city: 'Berlin',
            street: '',
            zip: '',
            phone: '',
            url: '',
            questions: '',
        });
        expect(out?.kind).toBe('code');
        if (out?.kind === 'code') {
            const parsed = JSON.parse(out.content);
            expect(parsed['@type']).toBe('LocalBusiness');
            expect(parsed.name).toBe('Test GmbH');
        }
    });

    test('faq json', () => {
        const out = generateSchema({
            schemaType: 'faq',
            questions: 'Was kostet es? | Ab 50 Euro.',
            name: '',
            street: '',
            zip: '',
            city: '',
            phone: '',
            url: '',
        });
        expect(out?.kind).toBe('code');
        if (out?.kind === 'code') {
            const parsed = JSON.parse(out.content);
            expect(parsed['@type']).toBe('FAQPage');
            expect(parsed.mainEntity).toHaveLength(1);
        }
    });
});
