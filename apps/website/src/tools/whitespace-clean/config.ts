import { defineGenerateTool } from '../_shared/shells';
import { generateWhitespaceClean } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'whitespace-clean',
            slug: 'whitespace-clean',
            shortTitle: 'Leerzeichen aufräumen',
            title: 'Leerzeichen & Umbrüche aufräumen',
            sub: 'Copy-Paste aus Word bereinigen — Spaces, Tabs und Leerzeilen.',
            pain: 'Text aus Word mit kaputten Umbrüchen und doppelten Spaces.',
            solution: 'Modus wählen — bereinigter Text zum Kopieren.',
            trust: 'Lokal bereinigt · nichts wird hochgeladen',
            tags: ['Text', 'Aufräumen', 'Schreiben'],
            keywords: [
                'zeilenumbrüche entfernen',
                'leerzeichen entfernen',
                'text bereinigen',
                'whitespace',
            ],
            fileHints: [],
            command: '/leerzeichen',
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
                placeholder: 'Text mit kaputten Spaces …',
                rows: 10,
            },
            {
                id: 'mode',
                type: 'segment',
                label: 'Modus',
                default: 'collapse',
                options: [
                    { value: 'collapse', label: 'Spaces' },
                    { value: 'trim-lines', label: 'Trim' },
                    { value: 'one-line', label: '1 Zeile' },
                    { value: 'blank-lines', label: 'Leerzeilen' },
                ],
            },
        ],
        generate: generateWhitespaceClean,
        isReady: (v) => (v.text ?? '').length > 0,
        outputTitle: 'Bereinigt',
    },
    'whitespace-clean',
);
