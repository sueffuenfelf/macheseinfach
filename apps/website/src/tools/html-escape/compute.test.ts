import { describe, expect, test } from 'bun:test';
import { generateHtmlEscape } from './compute';

describe('html-escape', () => {
    test('escapes tags', () => {
        const out = generateHtmlEscape({ mode: 'escape', text: '<a & b>' });
        expect(out?.kind).toBe('code');
        if (out?.kind === 'code') expect(out.content).toBe('&lt;a &amp; b&gt;');
    });

    test('unescapes', () => {
        const out = generateHtmlEscape({ mode: 'unescape', text: '&lt;a&gt;' });
        if (out?.kind === 'text') expect(out.content).toBe('<a>');
    });
});
