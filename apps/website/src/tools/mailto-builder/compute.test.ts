import { describe, expect, test } from 'bun:test';
import { generateMailtoLink } from './compute';

describe('mailto-builder', () => {
    test('builds mailto with subject', () => {
        const result = generateMailtoLink({ email: 'info@test.de', subject: 'Anfrage', body: '' });
        expect(result?.content).toContain('mailto:info@test.de');
        expect(result?.content).toContain('subject=');
    });
});
