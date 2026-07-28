import { describe, expect, test } from 'bun:test';
import { buildVCard } from '../_shared/kommunikation/vcard';
import { generateVCardQr } from './compute';

describe('vcard-qr', () => {
    test('builds vcard payload', () => {
        const vcard = buildVCard({ firstName: 'Max', lastName: 'Mustermann', email: 'max@example.de' });
        expect(vcard).toContain('BEGIN:VCARD');
        expect(vcard).toContain('max@example.de');
    });

    test('returns null without name', async () => {
        const result = await generateVCardQr({ firstName: '', lastName: '' });
        expect(result).toBeNull();
    });
});
