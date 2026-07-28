import { describe, expect, test } from 'bun:test';
import { generateMarkdownPreview, markdownToSafeHtml } from './compute';

describe('markdown-preview', () => {
    test('escapes raw html', () => {
        const html = markdownToSafeHtml('<script>alert(1)</script>');
        expect(html).not.toContain('<script>');
        expect(html).toContain('&lt;script&gt;');
    });

    test('renders heading and bold', () => {
        const html = markdownToSafeHtml('# Hallo\n\n**fett**');
        expect(html).toContain('<h1>Hallo</h1>');
        expect(html).toContain('<strong>fett</strong>');
    });

    test('only allows http(s) links', () => {
        const html = markdownToSafeHtml('[x](javascript:alert(1))\n\n[ok](https://example.com)');
        expect(html).not.toContain('href="javascript:');
        expect(html).toContain('href="https://example.com"');
    });

    test('generate output', () => {
        const out = generateMarkdownPreview({ text: '## Hi' });
        expect(out?.kind).toBe('code');
        if (out?.kind === 'code') expect(out.content).toContain('<h2>Hi</h2>');
    });
});
