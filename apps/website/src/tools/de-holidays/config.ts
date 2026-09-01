import { defineCalcTool } from '../_shared/shells';
import { BUNDESLAENDER } from '../_shared/zeit/holidays';
import { TRUST_LOCAL, ZEIT_THEME } from '../_shared/zeit/theme';
import { computeDeHolidays } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'de-holidays',
            slug: 'de-holidays',
            shortTitle: 'Feiertage DE',
            title: 'Feiertage in Deutschland',
            sub: 'Ist ein Datum Feiertag? Feiertagsliste nach Bundesland und Jahr.',
            pain: 'Ist Montag frei? Welche Feiertage hat Bayern 2026?',
            solution: 'Datum oder Jahr wählen — Feiertage nach Bundesland anzeigen.',
            trust: TRUST_LOCAL,
            tags: ['Zeit', 'Feiertage', 'Prüfen'],
            keywords: [
                'feiertage 2026',
                'feiertage bayern',
                'ist heute feiertag',
                'feiertag deutschland',
            ],
            fileHints: [],
            command: '/feiertage',
            entry: 'form',
            entryPlaceholder: 'Datum oder Jahr',
            theme: ZEIT_THEME,
            maturity: 'stable',
            areas: ['zeit'],
        },
        fields: [
            {
                id: 'mode',
                type: 'segment',
                label: 'Modus',
                default: 'date',
                options: [
                    { value: 'date', label: 'Datum prüfen' },
                    { value: 'year', label: 'Jahresübersicht' },
                ],
            },
            { id: 'date', type: 'date', label: 'Datum' },
            {
                id: 'year',
                type: 'number',
                label: 'Jahr',
                placeholder: '2026',
                default: '2026',
            },
            {
                id: 'region',
                type: 'segment',
                label: 'Bundesland',
                default: 'NW',
                options: BUNDESLAENDER.map((b) => ({ value: b.value, label: b.label })),
            },
        ],
        compute: computeDeHolidays,
        intro: 'Gesetzliche Feiertage nach Bundesland. Keine Schulferien oder regionale Brauchtage außerhalb der Bibliothek.',
    },
    'de-holidays',
);
