import { describe, expect, test } from 'bun:test';
import { generateHandoverChecklist } from './compute';

describe('handover-checklist', () => {
    test('move-in checklist has checkboxes', () => {
        const out = generateHandoverChecklist({ kind: 'in' });
        expect(out?.kind).toBe('text');
        if (out?.kind === 'text') {
            expect(out.content).toContain('[ ] 1.');
            expect(out.content).toContain('Einzug');
        }
    });

    test('move-out checklist', () => {
        const out = generateHandoverChecklist({ kind: 'out' });
        if (out?.kind === 'text') {
            expect(out.content).toContain('Auszug');
            expect(out.content).toContain('Schlüssel');
        }
    });
});
