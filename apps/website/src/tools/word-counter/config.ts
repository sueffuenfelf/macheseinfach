import { defineCalcTool } from '../_shared/shells';
import { computeWordCount } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'word-counter',
            slug: 'word-counter',
            shortTitle: 'Wortzähler',
            title: 'Wortzähler',
            sub: 'Wörter, Absätze und grobe Lesedauer — live im Browser.',
            pain: 'Hausarbeit oder Brief — unklar, wie viele Wörter und wie lange zum Lesen.',
            solution: 'Text einfügen — Wortzahl und Lesedauer erscheinen sofort.',
            trust: 'Lokal gezählt · nichts wird hochgeladen',
            tags: ['Text', 'Zähler', 'Schreiben'],
            keywords: [
                'wortzähler',
                'wörter zählen',
                'lesedauer berechnen',
                'wortanzahl',
                'textlänge',
            ],
            fileHints: [],
            command: '/woerter',
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
                rows: 10,
            },
        ],
        compute: computeWordCount,
        intro: 'Lesedauer ist eine grobe Schätzung (~200 Wörter/Minute).',
    },
    'word-counter',
);
