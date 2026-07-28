import { defineGenerateTool } from '../_shared/shells';
import { generateFindReplaceBulk } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'find-replace-bulk',
            slug: 'find-replace-bulk',
            shortTitle: 'Suchen & Ersetzen',
            title: 'Suchen & Ersetzen (Liste)',
            sub: 'Viele Ersetzungen auf einmal — eine Regel pro Zeile.',
            pain: 'Mehrere Begriffe in einem Text ersetzen, ohne einzeln zu klicken.',
            solution: 'Text + Regelliste — Ergebnis zum Kopieren.',
            trust: 'Lokal ersetzt · nichts wird hochgeladen',
            tags: ['Text', 'Umwandeln', 'Schreiben'],
            keywords: [
                'suchen ersetzen online',
                'mehrfach ersetzen text',
                'find replace bulk',
                'text ersetzen liste',
            ],
            fileHints: [],
            command: '/ersetzen',
            entry: 'form',
            entryPlaceholder: 'Text und Regeln …',
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
                placeholder: 'Ausgangstext …',
                rows: 8,
            },
            {
                id: 'rules',
                type: 'textarea',
                label: 'Regeln (eine pro Zeile)',
                placeholder: 'alt => neu\nfoo=bar',
                hint: 'Format: find => replace oder find=replace. Zeilen mit # sind Kommentare.',
                rows: 6,
            },
        ],
        generate: generateFindReplaceBulk,
        isReady: (v) => (v.text ?? '').length > 0 && (v.rules ?? '').trim().length > 0,
        outputTitle: 'Ergebnis',
        emptyHint: 'Text und mindestens eine Regel — dann erscheint das Ergebnis.',
    },
    'find-replace-bulk',
);
