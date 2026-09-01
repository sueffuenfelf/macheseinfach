import { defineCalcTool } from '../_shared/shells';
import { TRUST_LOCAL, ZEIT_THEME } from '../_shared/zeit/theme';
import { computeCountdown } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'countdown',
            slug: 'countdown',
            shortTitle: 'Countdown',
            title: 'Tage bis zum Datum',
            sub: 'Deadline, Event oder Urlaub — wie viele Tage noch?',
            pain: 'Wann ist die Deadline — wie viele Tage habe ich noch?',
            solution: 'Zieldatum wählen — Countdown erscheint sofort.',
            trust: TRUST_LOCAL,
            tags: ['Zeit', 'Zähler', 'Frist'],
            keywords: [
                'countdown rechner',
                'tage bis datum',
                'countdown generieren',
                'deadline tage',
            ],
            fileHints: [],
            command: '/countdown',
            entry: 'form',
            entryPlaceholder: 'Zieldatum',
            theme: ZEIT_THEME,
            maturity: 'stable',
            areas: ['zeit'],
        },
        fields: [
            { id: 'target', type: 'date', label: 'Zieldatum' },
            {
                id: 'reference',
                type: 'date',
                label: 'Bezugsdatum',
                hint: 'Leer = heute',
            },
        ],
        compute: computeCountdown,
        intro: 'Kalendertage zwischen Bezugs- und Zieldatum. Positiv = noch in der Zukunft.',
    },
    'countdown',
);
