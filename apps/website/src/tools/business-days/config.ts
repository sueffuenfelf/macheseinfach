import { defineCalcTool } from '../_shared/shells';
import { BUNDESLAENDER } from '../_shared/zeit/holidays';
import { TRUST_LOCAL, ZEIT_THEME } from '../_shared/zeit/theme';
import { computeBusinessDays } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'business-days',
            slug: 'business-days',
            shortTitle: 'Werktage rechnen',
            title: 'Werktage zwischen zwei Daten',
            sub: 'Lieferfristen und Fristen in Arbeitstagen — optional ohne Feiertage.',
            pain: '„5 Werktage“ — wie viele Kalendertage sind das wirklich?',
            solution: 'Von/Bis wählen — Werktage erscheinen sofort.',
            trust: TRUST_LOCAL,
            tags: ['Zeit', 'Zähler', 'Frist'],
            keywords: ['werktage berechnen', 'werktage zwischen', 'arbeitstage rechnen', 'lieferfrist'],
            fileHints: [],
            command: '/werktage',
            entry: 'form',
            entryPlaceholder: 'Von / Bis',
            theme: ZEIT_THEME,
            maturity: 'stable',
            areas: ['zeit'],
            storyIds: [],
        },
        fields: [
            { id: 'from', type: 'date', label: 'Von' },
            { id: 'to', type: 'date', label: 'Bis' },
            {
                id: 'holidays',
                type: 'segment',
                label: 'Feiertage',
                default: 'no',
                options: [
                    { value: 'no', label: 'Nur Wochenende' },
                    { value: 'yes', label: 'Ohne Feiertage' },
                ],
            },
            {
                id: 'region',
                type: 'segment',
                label: 'Bundesland',
                default: 'NW',
                options: BUNDESLAENDER.map((b) => ({ value: b.value, label: b.label })),
            },
        ],
        compute: computeBusinessDays,
        intro: 'Werktage = Montag–Freitag. Mit Feiertagsoption werden gesetzliche Feiertage des Bundeslands abgezogen.',
    },
    'business-days',
);
