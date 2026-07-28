import { describe, expect, test } from 'bun:test';
import { computeRemPx } from './compute';

test('1rem = 16px', () => {
    const r = computeRemPx({ mode: 'rem-to-px', value: '1', base: '16' });
    expect(r.rows?.[2]?.value).toContain('16');
});
