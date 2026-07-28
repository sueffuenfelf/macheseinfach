import { describe, expect, test } from 'bun:test';
import { generateWhatsappLink } from './compute';

describe('whatsapp-link', () => {
    test('builds wa.me link', () => {
        const result = generateWhatsappLink({ phone: '0151 12345678', message: 'Hallo' });
        expect(result?.content).toContain('wa.me/4915112345678');
        expect(result?.content).toContain('text=');
    });
});
