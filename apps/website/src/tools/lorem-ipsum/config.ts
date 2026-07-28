import { defineGenerateTool } from '../_shared/shells';
import { generateLoremIpsum } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'lorem-ipsum',
            slug: 'lorem-ipsum',
            shortTitle: 'Platzhaltertext',
            title: 'Platzhaltertext (Lorem)',
            sub: 'Blindtext auf Deutsch oder Latein — Layout füllen ohne echten Content.',
            pain: 'Layout füllen, aber noch kein fertiger Text.',
            solution: 'Absätze wählen — Blindtext zum Kopieren.',
            trust: 'Lokal erzeugt · nichts wird hochgeladen',
            tags: ['Text', 'Platzhalter', 'Schreiben'],
            keywords: [
                'lorem ipsum generator',
                'blindtext generator deutsch',
                'platzhaltertext',
                'dummy text',
            ],
            fileHints: [],
            command: '/lorem',
            entry: 'form',
            entryPlaceholder: 'Anzahl Absätze …',
            theme: { accent: '#7dd3c0', accentStrong: '#000', accentSoft: '#e8f7f3' },
            maturity: 'stable',
            areas: ['text'],
            storyIds: [],
        },
        fields: [
            {
                id: 'paragraphs',
                type: 'number',
                label: 'Absätze',
                default: '3',
                placeholder: '3',
            },
            {
                id: 'lang',
                type: 'segment',
                label: 'Sprache',
                default: 'de',
                options: [
                    { value: 'de', label: 'Deutsch' },
                    { value: 'la', label: 'Latein' },
                ],
            },
        ],
        generate: generateLoremIpsum,
        isReady: (v) => {
            const n = Number(v.paragraphs ?? '');
            return Number.isFinite(n) && n >= 1;
        },
        outputTitle: 'Blindtext',
    },
    'lorem-ipsum',
);
