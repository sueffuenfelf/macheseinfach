import { describe, expect, test } from 'bun:test';
import { computeHexRgb } from './compute';

test('hex to rgb', () => {
    const r = computeHexRgb({ mode: 'hex-to-rgb', input: '#ff0000' });
    expect(r.rows?.[1]?.value).toBe('rgb(255, 0, 0)');
});
