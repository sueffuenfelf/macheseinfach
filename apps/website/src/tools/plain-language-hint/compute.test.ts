import { describe, expect, test } from 'bun:test';
import { analyzePlainLanguage } from './compute';

test('flags long sentences', () => {
    const long = 'Wort '.repeat(25) + '.';
    const f = analyzePlainLanguage(long);
    expect(f.some((x) => x.id === 'long')).toBe(true);
});
