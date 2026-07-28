import { describe, expect, test } from 'bun:test';
import { generateCronExplain } from './compute';

describe('cron-explain', () => {
    test('explains weekday mornings', () => {
        const out = generateCronExplain({ expr: '0 9 * * 1-5' });
        expect(out?.kind).toBe('text');
        if (out?.kind === 'text') {
            expect(out.content).toContain('0 9 * * 1-5');
            expect(out.content.toLowerCase()).toMatch(/9|montag|freitag|wochentag/);
        }
    });
});
