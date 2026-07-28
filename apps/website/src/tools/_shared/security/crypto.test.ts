import { describe, expect, test } from 'bun:test';
import { sha1HexUpper, sha256Hex } from './crypto';

describe('security crypto', () => {
    test('sha1HexUpper produces uppercase hex', async () => {
        const hash = await sha1HexUpper('password');
        expect(hash).toMatch(/^[0-9A-F]{40}$/);
        expect(hash).toBe('5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8');
    });

    test('sha256Hex hashes bytes', async () => {
        const data = new TextEncoder().encode('test');
        const hash = await sha256Hex(data);
        expect(hash).toBe('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
    });
});
