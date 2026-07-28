import { describe, expect, test } from 'bun:test';
import { generateEmailSignature } from './compute';

describe('email-signature', () => {
    test('generates html with name', () => {
        const result = generateEmailSignature({ name: 'Max Mustermann', email: 'max@test.de' });
        expect(result?.content).toContain('Max Mustermann');
        expect(result?.content).toContain('mailto:max@test.de');
    });
});
