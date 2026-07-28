import { describe, expect, test } from 'bun:test';
import { generateTextHash } from './compute';

describe('text-hash', () => {
    test('sha-256 of empty-ish known vector', async () => {
        const out = await generateTextHash({ algo: 'SHA-256', text: 'abc' });
        expect(out?.kind).toBe('code');
        if (out?.kind === 'code') {
            expect(out.content).toContain(
                'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
            );
        }
    });
});
