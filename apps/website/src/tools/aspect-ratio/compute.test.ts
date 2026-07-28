import { describe, expect, test } from 'bun:test';
import { computeAspectRatio } from './compute';

test('16:9 from 1920x1080', () => {
    const r = computeAspectRatio({ mode: 'size-to-ratio', width: '1920', height: '1080' });
    expect(r.rows?.[1]?.value).toBe('16:9');
});
