import { defineCalcTool } from '../_shared/shells';
import { TRUST_LOCAL, ZEIT_THEME } from '../_shared/zeit/theme';
import { computeTimezoneConvert, TIME_ZONES } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'timezone-convert',
            slug: 'timezone-convert',
            shortTitle: 'Zeitzone',
            title: 'Zeitzonen-Umrechner',
            sub: 'Uhrzeit zwischen Zeitzonen — für Calls mit US, UK und Co.',
            pain: 'Meeting um 15:00 Berlin — wie spät ist das in New York?',
            solution: 'Datum, Uhrzeit und Zonen wählen — Ergebnis sofort.',
            trust: TRUST_LOCAL,
            tags: ['Zeit', 'Umwandeln'],
            keywords: ['zeitzone umrechner', 'utc nach mez', 'world clock convert', 'uhrzeit umrechnen'],
            fileHints: [],
            command: '/zeitzone',
            entry: 'form',
            entryPlaceholder: 'Datum und Uhrzeit',
            theme: ZEIT_THEME,
            maturity: 'stable',
            areas: ['zeit'],
            storyIds: [],
        },
        fields: [
            { id: 'date', type: 'date', label: 'Datum' },
            { id: 'time', type: 'text', label: 'Uhrzeit', placeholder: '14:30', default: '12:00' },
            {
                id: 'fromZone',
                type: 'segment',
                label: 'Von',
                default: 'Europe/Berlin',
                options: TIME_ZONES.map((z) => ({ value: z.value, label: z.label })),
            },
            {
                id: 'toZone',
                type: 'segment',
                label: 'Nach',
                default: 'UTC',
                options: TIME_ZONES.map((z) => ({ value: z.value, label: z.label })),
            },
        ],
        compute: computeTimezoneConvert,
        intro: 'Umrechnung über IANA-Zeitzonen (Intl API). Sommerzeit wird automatisch berücksichtigt.',
    },
    'timezone-convert',
);
