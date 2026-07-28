import { describe, expect, test } from 'bun:test';
import { computeAltTextLength } from './compute';

test('warns on empty-ish short text', () => {
    const r = computeAltTextLength({ text: 'Hi' });
    expect(r.tone).toBe('warn');
});
