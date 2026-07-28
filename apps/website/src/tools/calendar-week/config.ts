import { defineCalcTool } from '../_shared/shells';
import { TRUST_LOCAL, ZEIT_THEME } from '../_shared/zeit/theme';
import { computeCalendarWeek } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'calendar-week',
            slug: 'calendar-week',
            shortTitle: 'Kalenderwoche',
            title: 'Kalenderwoche (ISO) berechnen',
            sub: 'Welche KW hat ein Datum? ISO 8601 — für Rechnungen und Planung.',
            pain: 'Auf der Rechnung steht „KW 12“ — welches Datum ist gemeint?',
            solution: 'Datum wählen — ISO-Kalenderwoche erscheint sofort.',
            trust: TRUST_LOCAL,
            tags: ['Zeit', 'Umwandeln'],
            keywords: ['kalenderwoche', 'welche kw', 'kw rechner', 'iso woche'],
            fileHints: [],
            command: '/kw',
            entry: 'form',
            entryPlaceholder: 'Datum wählen',
            theme: ZEIT_THEME,
            maturity: 'stable',
            areas: ['zeit'],
            storyIds: [],
        },
        fields: [{ id: 'date', type: 'date', label: 'Datum' }],
        compute: computeCalendarWeek,
        intro: 'Berechnet die ISO-Kalenderwoche (Montag = Wochenanfang).',
    },
    'calendar-week',
);
