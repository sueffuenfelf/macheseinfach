import { defineCalcTool } from '../_shared/shells';
import { TRUST_LOCAL, ZEIT_THEME } from '../_shared/zeit/theme';
import { computeDateDiff } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'date-diff',
            slug: 'date-diff',
            shortTitle: 'Tage zwischen Daten',
            title: 'Tage zwischen zwei Daten',
            sub: 'Abstand in Tagen und groben Wochen — inkl. optionaler Spanne.',
            pain: 'Reise, Projekt, Urlaub — wie viele Tage liegen dazwischen?',
            solution: 'Zwei Daten wählen — Differenz erscheint sofort.',
            trust: TRUST_LOCAL,
            tags: ['Zeit', 'Zähler'],
            keywords: [
                'tage zwischen zwei daten',
                'datum differenz',
                'wieviele tage',
                'datumsrechner',
            ],
            fileHints: [],
            command: '/tage',
            entry: 'form',
            entryPlaceholder: 'Von / Bis',
            theme: ZEIT_THEME,
            maturity: 'stable',
            areas: ['zeit'],
            storyIds: [],
        },
        fields: [
            { id: 'a', type: 'date', label: 'Von' },
            { id: 'b', type: 'date', label: 'Bis' },
            {
                id: 'inclusive',
                type: 'segment',
                label: 'Spanne',
                default: 'no',
                options: [
                    { value: 'no', label: 'Differenz' },
                    { value: 'yes', label: 'Inkl. beider' },
                ],
            },
        ],
        compute: computeDateDiff,
        intro: 'Kalendertage (Mitternacht lokal). Keine Feiertags-/Werktagslogik.',
    },
    'date-diff',
);
