import { defineGenerateTool } from '../_shared/shells';
import { generateLineDedupe } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'line-dedupe',
            slug: 'line-dedupe',
            shortTitle: 'Duplikate entfernen',
            title: 'Doppelte Zeilen entfernen',
            sub: 'Listen und Exporte bereinigen — erste Vorkommen bleiben.',
            pain: 'Excel-Export oder Liste mit doppelten Zeilen.',
            solution: 'Text einfügen — Duplikate verschwinden, Reihenfolge bleibt.',
            trust: 'Lokal bereinigt · nichts wird hochgeladen',
            tags: ['Text', 'Aufräumen', 'Schreiben'],
            keywords: [
                'doppelte zeilen entfernen',
                'duplikate text',
                'unique lines',
                'zeilen duplikate',
            ],
            fileHints: [],
            command: '/dedupe',
            entry: 'form',
            entryPlaceholder: 'Liste einfügen …',
            theme: { accent: '#7dd3c0', accentStrong: '#000', accentSoft: '#e8f7f3' },
            maturity: 'stable',
            areas: ['text'],
        },
        fields: [
            {
                id: 'text',
                type: 'textarea',
                label: 'Text / Liste',
                placeholder: 'Eine Zeile pro Eintrag …',
                rows: 10,
            },
            {
                id: 'keepEmpty',
                type: 'segment',
                label: 'Leere Zeilen',
                default: 'no',
                options: [
                    { value: 'no', label: 'Behalten' },
                    { value: 'yes', label: 'Auch deduplizieren' },
                ],
            },
        ],
        generate: generateLineDedupe,
        isReady: (v) => (v.text ?? '').length > 0,
        outputTitle: 'Bereinigt',
        emptyHint: 'Liste einfügen — bereinigter Text erscheint hier.',
    },
    'line-dedupe',
);
