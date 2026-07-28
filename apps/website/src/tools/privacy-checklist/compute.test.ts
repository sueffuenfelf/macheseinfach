import { describe, expect, test } from 'bun:test';
import { generatePrivacyChecklist } from './compute';

describe('privacy-checklist', () => {
    test('shop includes widerruf', () => {
        const result = generatePrivacyChecklist({ scope: 'shop' });
        expect(result?.content).toContain('Widerrufsbelehrung');
    });
});
