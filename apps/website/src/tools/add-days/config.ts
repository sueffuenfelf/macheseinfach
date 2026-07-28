import { defineCalcTool } from '../_shared/shells';
import { TRUST_LOCAL, ZEIT_THEME } from '../_shared/zeit/theme';
import { computeAddDays } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'add-days',
            slug: 'add-days',
            shortTitle: 'Datum + X Tage',
            title: 'Datum plus Tage oder Monate',
            sub: 'Fristen und Widerrufsfristen — Startdatum + Zeitraum.',
            pain: '„+14 Tage Widerruf“ oder „+1 Monat“ — welches Datum ist das?',
            solution: 'Startdatum und Anzahl eingeben — Zieldatum erscheint sofort.',
            trust: TRUST_LOCAL,
            tags: ['Zeit', 'Frist', 'Umwandeln'],
            keywords: ['datum plus tage', '14 tage ab heute', 'frist berechnen', 'datum addieren'],
            fileHints: [],
            command: '/datum-plus',
            entry: 'form',
            entryPlaceholder: 'Startdatum wählen',
            theme: ZEIT_THEME,
            maturity: 'stable',
            areas: ['zeit'],
            storyIds: [],
        },
        fields: [
            { id: 'start', type: 'date', label: 'Startdatum' },
            {
                id: 'amount',
                type: 'number',
                label: 'Anzahl',
                placeholder: '14',
                default: '14',
            },
            {
                id: 'unit',
                type: 'segment',
                label: 'Einheit',
                default: 'days',
                options: [
                    { value: 'days', label: 'Tage' },
                    { value: 'months', label: 'Monate' },
                ],
            },
        ],
        compute: computeAddDays,
        intro: 'Addiert Tage oder Monate zum Startdatum. Negative Werte ziehen ab.',
    },
    'add-days',
);
