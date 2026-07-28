import { describe, expect, test } from 'bun:test';
import { redactText } from './compute';

describe('privacy-redact-text compute', () => {
    test('masks email and name patterns', () => {
        const { output, counts } = redactText('Kontakt: Max Mustermann, max@beispiel.de');
        expect(output).not.toContain('max@beispiel.de');
        expect(output).toContain('@beispiel.de');
        expect(output).not.toContain('Mustermann');
        expect(counts.emails).toBe(1);
        expect(counts.names).toBeGreaterThanOrEqual(1);
    });

    test('leaves clean text unchanged', () => {
        const { output, counts } = redactText('Hallo Welt');
        expect(output).toBe('Hallo Welt');
        expect(counts.emails).toBe(0);
    });
});
