import { describe, expect, test } from 'bun:test';
import { __parseAssistantMarkdownForTests } from './AssistantMarkdown';

describe('AssistantMarkdown parser', () => {
    test('parses headings, lists, and code fences', () => {
        const blocks = __parseAssistantMarkdownForTests(
            '# Titel\n\n- eins\n- zwei\n\n```\ncode\n```\n\nAbsatz mit **fett**.',
        );
        expect(blocks[0]).toEqual({ type: 'heading', level: 1, text: 'Titel' });
        expect(blocks[1]).toEqual({ type: 'list', ordered: false, items: ['eins', 'zwei'] });
        expect(blocks[2]).toEqual({ type: 'code', text: 'code' });
        expect(blocks[3]).toEqual({ type: 'paragraph', text: 'Absatz mit **fett**.' });
    });

    test('parses ordered lists and quotes', () => {
        const blocks = __parseAssistantMarkdownForTests('1. a\n2. b\n\n> Hinweis');
        expect(blocks[0]).toEqual({ type: 'list', ordered: true, items: ['a', 'b'] });
        expect(blocks[1]).toEqual({ type: 'quote', text: 'Hinweis' });
    });
});
