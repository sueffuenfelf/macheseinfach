import { describe, expect, test } from 'bun:test';
import { generateBase64 } from './compute';

describe('base64', () => {
    test('encode roundtrip', () => {
        const enc = generateBase64({ mode: 'encode', text: 'Hallo' });
        expect(enc?.kind).toBe('code');
        if (enc?.kind !== 'code') return;
        const dec = generateBase64({ mode: 'decode', text: enc.content });
        expect(dec?.kind).toBe('text');
        if (dec?.kind === 'text') expect(dec.content).toBe('Hallo');
    });
});
