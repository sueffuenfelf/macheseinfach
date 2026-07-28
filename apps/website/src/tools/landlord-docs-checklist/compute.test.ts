import { describe, expect, test } from 'bun:test';
import { generateLandlordDocsChecklist } from './compute';

describe('landlord-docs-checklist', () => {
    test('includes income proofs', () => {
        const out = generateLandlordDocsChecklist({ role: 'tenant' });
        if (out?.kind === 'text') {
            expect(out.content).toContain('Einkommensnachweise');
            expect(out.content).toContain('Schufa');
        }
    });
});
