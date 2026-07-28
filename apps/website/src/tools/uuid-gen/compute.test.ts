import { describe, expect, test } from 'bun:test';
import { generateUuid } from './compute';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('uuid-gen', () => {
    test('generates v4 uuid', () => {
        const out = generateUuid({ count: '1' });
        expect(out?.kind).toBe('code');
        if (out?.kind === 'code') expect(out.content).toMatch(UUID_RE);
    });

    test('generates multiple', () => {
        const out = generateUuid({ count: '3' });
        if (out?.kind === 'code') expect(out.content.split('\n')).toHaveLength(3);
    });
});
