import { describe, expect, test } from 'bun:test';
import { analyzeLinkText } from './compute';

test('warns on hier klicken', () => {
    const f = analyzeLinkText('<a href="/x">hier</a>');
    expect(f.some((x) => x.severity === 'warn')).toBe(true);
});
