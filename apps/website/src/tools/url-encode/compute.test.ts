import { describe, expect, test } from 'bun:test';
import { generateUrlEncode } from './compute';

describe('url-encode', () => {
    test('encode space', () => {
        const out = generateUrlEncode({ mode: 'encode', text: 'a b' });
        expect(out?.kind).toBe('code');
        if (out?.kind === 'code') expect(out.content).toBe('a%20b');
    });

    test('decode', () => {
        const out = generateUrlEncode({ mode: 'decode', text: 'a%20b' });
        if (out?.kind === 'text') expect(out.content).toBe('a b');
    });
});
