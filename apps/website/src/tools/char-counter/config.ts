import { defineCalcTool } from '../_shared/shells';
import { computeCharCount } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'char-counter',
            slug: 'char-counter',
            shortTitle: 'Zeichenzähler',
            title: 'Zeichenzähler',
            sub: 'Zeichen, Bytes und Zeilen live zählen — optional gegen ein Limit prüfen.',
            pain: 'Meta-Description, Tweet oder SMS — unsicher, ob das Limit passt.',
            solution: 'Text einfügen — Zeichenzahl und Freiraum erscheinen sofort.',
            trust: 'Lokal gezählt · nichts wird hochgeladen',
            tags: ['Text', 'Zähler', 'Schreiben'],
            keywords: [
                'zeichenzähler',
                'zeichen zählen',
                'text zähler',
                'meta description länge',
                'zeichenlimit',
            ],
            fileHints: [],
            command: '/zeichen',
            entry: 'form',
            entryPlaceholder: 'Text einfügen …',
            theme: { accent: '#7dd3c0', accentStrong: '#000', accentSoft: '#e8f7f3' },
            maturity: 'stable',
            areas: ['text'],
            storyIds: [],
        },
        fields: [
            {
                id: 'text',
                type: 'textarea',
                label: 'Text',
                placeholder: 'Text hier einfügen …',
                rows: 8,
            },
            {
                id: 'limit',
                type: 'number',
                label: 'Zeichenlimit (optional)',
                placeholder: 'z. B. 160',
            },
        ],
        compute: computeCharCount,
        intro: 'Zählt Unicode-Zeichen (inkl. Emoji). Limit ist optional.',
    },
    'char-counter',
);
