import { describe, expect, test } from 'bun:test';
import { applyBulkReplace, generateFindReplaceBulk, parseReplaceRules } from './compute';

describe('find-replace-bulk', () => {
    test('parses arrow and equals rules', () => {
        expect(parseReplaceRules('foo => bar\nbaz=qux\n# comment\n')).toEqual([
            { find: 'foo', replace: 'bar' },
            { find: 'baz', replace: 'qux' },
        ]);
    });

    test('applies all rules', () => {
        const out = applyBulkReplace('foo baz foo', [
            { find: 'foo', replace: 'X' },
            { find: 'baz', replace: 'Y' },
        ]);
        expect(out).toBe('X Y X');
    });

    test('generate', () => {
        const out = generateFindReplaceBulk({
            text: 'Hallo Welt',
            rules: 'Welt => Erde',
        });
        expect(out?.kind).toBe('text');
        if (out?.kind === 'text') expect(out.content).toBe('Hallo Erde');
    });
});
