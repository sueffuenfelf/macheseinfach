import { defineGenerateTool } from '../_shared/shells';
import { generateTextDiff } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'text-diff',
            slug: 'text-diff',
            shortTitle: 'Text vergleichen',
            title: 'Text vergleichen (Diff)',
            sub: 'Zwei Versionen vergleichen — Unified Diff lokal im Browser.',
            pain: 'Zwei Versionen eines Vertrags oder einer Mail — was hat sich geändert?',
            solution: 'Beide Texte einfügen — Diff erscheint sofort.',
            trust: 'Lokal verglichen · nichts wird hochgeladen',
            tags: ['Text', 'Diff', 'Schreiben'],
            keywords: [
                'text vergleichen',
                'unterschied text',
                'diff online',
                'text diff',
                'änderungen finden',
            ],
            fileHints: [],
            command: '/diff',
            entry: 'form',
            entryPlaceholder: 'Zwei Texte …',
            theme: { accent: '#7dd3c0', accentStrong: '#000', accentSoft: '#e8f7f3' },
            maturity: 'stable',
            areas: ['text'],
            storyIds: ['story-text-diff'],
        },
        fields: [
            {
                id: 'a',
                type: 'textarea',
                label: 'Text A (alt)',
                placeholder: 'Erste Version …',
                rows: 6,
            },
            {
                id: 'b',
                type: 'textarea',
                label: 'Text B (neu)',
                placeholder: 'Zweite Version …',
                rows: 6,
            },
        ],
        generate: generateTextDiff,
        isReady: (v) => (v.a ?? '').length > 0 || (v.b ?? '').length > 0,
        outputTitle: 'Diff',
        emptyHint: 'Beide Texte einfügen — der Diff erscheint hier.',
    },
    'text-diff',
);
