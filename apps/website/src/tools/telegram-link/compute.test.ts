import { describe, expect, test } from 'bun:test';
import { generateTelegramLink } from './compute';

describe('telegram-link', () => {
    test('builds t.me link', () => {
        const result = generateTelegramLink({ username: '@beispiel', message: 'Hi' });
        expect(result?.content).toContain('t.me/beispiel');
    });
});
