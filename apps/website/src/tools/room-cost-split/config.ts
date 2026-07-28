import { defineCalcTool } from '../_shared/shells';
import { TRUST_LOCAL, WOHNEN_THEME } from '../_shared/wohnen/theme';
import { computeRoomCostSplit } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'room-cost-split',
            slug: 'room-cost-split',
            shortTitle: 'WG-Kosten teilen',
            title: 'WG-Kosten aufteilen',
            sub: 'Miete und Nebenkosten fair splitten — gleich oder nach Zimmergröße.',
            pain: 'Wer zahlt wie viel in der WG?',
            solution: 'Betrag und Personen eingeben — Anteile erscheinen sofort.',
            trust: TRUST_LOCAL,
            tags: ['WG', 'Miete', 'Rechnen'],
            keywords: [
                'wg kosten teilen',
                'miete aufteilen',
                'nebenkosten wg',
                'wg rechner',
            ],
            fileHints: [],
            command: '/wg',
            entry: 'form',
            entryPlaceholder: 'Gesamtmiete …',
            theme: WOHNEN_THEME,
            maturity: 'stable',
            areas: ['wohnen'],
            storyIds: [],
        },
        fields: [
            {
                id: 'total',
                type: 'currency',
                label: 'Gesamt / Monat',
                placeholder: '1.400,00',
            },
            {
                id: 'people',
                type: 'number',
                label: 'Personen',
                placeholder: '3',
                default: '2',
            },
            {
                id: 'mode',
                type: 'segment',
                label: 'Modus',
                default: 'equal',
                options: [
                    { value: 'equal', label: 'Gleich' },
                    { value: 'by-size', label: 'Nach m²' },
                ],
            },
            {
                id: 'sizes',
                type: 'text',
                label: 'Zimmerflächen (m²)',
                placeholder: '12, 14, 16',
                hint: 'Nur bei „Nach m²“ — kommagetrennt, eine Zahl pro Person.',
            },
        ],
        compute: computeRoomCostSplit,
        intro: TRUST_LOCAL,
    },
    'room-cost-split',
);
