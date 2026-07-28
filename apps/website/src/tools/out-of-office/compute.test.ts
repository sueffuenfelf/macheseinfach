import { describe, expect, test } from 'bun:test';
import { generateOutOfOffice } from './compute';

describe('out-of-office', () => {
    test('german template', () => {
        const result = generateOutOfOffice({ lang: 'de', fromDate: '01.08.', untilDate: '15.08.' });
        expect(result?.content).toContain('Abwesenheitsnotiz');
    });
});
