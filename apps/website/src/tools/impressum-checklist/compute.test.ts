import { describe, expect, test } from 'bun:test';
import { generateImpressumChecklist } from './compute';

describe('impressum-checklist', () => {
    test('generates business checklist', () => {
        const result = generateImpressumChecklist({ siteType: 'business' });
        expect(result?.content).toContain('Handelsregister');
    });
});
