import { describe, expect, test } from 'bun:test';
import { getTool } from '../data/catalog';
import { computeDeposit } from '../tools/deposit-calc/compute';
import { defaultsFromFields } from '../tools/_shared/shells';
import type { FieldDef } from '../tools/_shared/shells';
import { runCatalogTool } from './shellRunner';

const catalogLoaded = Boolean(getTool('iban-validate'));

const DEPOSIT_FIELDS: FieldDef[] = [
    {
        id: 'cold',
        type: 'currency',
        label: 'Kaltmiete (monatlich)',
        placeholder: '850,00',
    },
];

describe('runCatalogTool (deposit-calc via shell registry)', () => {
    test.skipIf(!catalogLoaded)('computes deposit when shell is registered', async () => {
        const direct = computeDeposit({ ...defaultsFromFields(DEPOSIT_FIELDS), cold: '900' });
        expect(direct.error).toBeUndefined();

        const result = await runCatalogTool('deposit-calc', { cold: '900' });
        expect(result.ok).toBe(true);
        expect(result.summary).toContain('Kaution');
    });

    test.skipIf(!catalogLoaded)('iban-validate bespoke runner', async () => {
        const result = await runCatalogTool('iban-validate', {
            iban: 'DE89370400440532013000',
        });
        expect(result.ok).toBe(true);
        expect(result.summary).toContain('IBAN');
    });

    test('rejects non-object input', async () => {
        const result = await runCatalogTool('deposit-calc', 'nope');
        expect(result.ok).toBe(false);
    });

    test.skipIf(!catalogLoaded)('hash-file runs headless via extract shell', async () => {
        const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
        const result = await runCatalogTool('hash-file', { file });
        expect(result.ok).toBe(true);
        expect(result.summary).toContain('SHA');
    });

    test.skipIf(!catalogLoaded)('pdf-redact requires UI', async () => {
        const file = new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' });
        const result = await runCatalogTool('pdf-redact', { file });
        expect(result.ok).toBe(false);
        expect(result.summary).toContain('Oberfläche');
    });
});
