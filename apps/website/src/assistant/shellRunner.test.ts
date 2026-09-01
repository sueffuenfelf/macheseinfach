import { describe, expect, test } from 'bun:test';
import { getTool } from '../data/catalog';
import { computePercent } from '../tools/percent-calc/compute';
import { defaultsFromFields } from '../tools/_shared/shells';
import type { FieldDef } from '../tools/_shared/shells';
import { runCatalogTool } from './shellRunner';

const catalogLoaded = Boolean(getTool('percent-calc'));

const PERCENT_FIELDS: FieldDef[] = [
    {
        id: 'mode',
        type: 'segment',
        label: 'Modus',
        default: 'of',
        options: [{ value: 'of', label: '% von' }],
    },
    {
        id: 'a',
        type: 'number',
        label: 'A',
        placeholder: '10',
    },
    {
        id: 'b',
        type: 'number',
        label: 'B',
        placeholder: '200',
    },
];

describe('runCatalogTool (percent-calc via shell registry)', () => {
    test.skipIf(!catalogLoaded)('computes percent when shell is registered', async () => {
        const direct = computePercent({
            ...defaultsFromFields(PERCENT_FIELDS),
            a: '10',
            b: '200',
        });
        expect(direct.error).toBeUndefined();

        const result = await runCatalogTool('percent-calc', { a: '10', b: '200', mode: 'of' });
        expect(result.ok).toBe(true);
        expect(result.summary).toContain('%');
    });

    test('rejects non-object input', async () => {
        const result = await runCatalogTool('percent-calc', 'nope');
        expect(result.ok).toBe(false);
    });

    test.skipIf(!catalogLoaded)('json-format runs via paste shell', async () => {
        const result = await runCatalogTool('json-format', { paste: '{"a":1}' });
        expect(result.ok).toBe(true);
    });

    test.skipIf(!catalogLoaded)('pdf-sign requires UI', async () => {
        const file = new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' });
        const result = await runCatalogTool('pdf-sign', { file });
        expect(result.ok).toBe(false);
        expect(result.summary).toContain('Oberfläche');
    });
});
