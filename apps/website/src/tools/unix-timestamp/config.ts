import { defineCalcTool } from '../_shared/shells';
import { TRUST_LOCAL, ZEIT_THEME } from '../_shared/zeit/theme';
import { computeUnixTimestamp } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'unix-timestamp',
            slug: 'unix-timestamp',
            shortTitle: 'Unix-Zeit',
            title: 'Unix-Timestamp umrechnen',
            sub: 'Epoch-Sekunden ↔ Datum — für Logs und API-Debug.',
            pain: 'Im Log steht 1735689600 — welches Datum ist das?',
            solution: 'Timestamp oder Datum eingeben — Umrechnung sofort.',
            trust: TRUST_LOCAL,
            tags: ['Zeit', 'Umwandeln', 'Dev'],
            keywords: ['unix timestamp', 'timestamp umrechnen', 'epoch converter', 'unix zeit'],
            fileHints: [],
            command: '/unix',
            entry: 'form',
            entryPlaceholder: 'Timestamp oder Datum',
            theme: ZEIT_THEME,
            maturity: 'stable',
            areas: ['zeit'],
        },
        fields: [
            {
                id: 'mode',
                type: 'segment',
                label: 'Richtung',
                default: 'to-date',
                options: [
                    { value: 'to-date', label: 'Timestamp → Datum' },
                    { value: 'to-ts', label: 'Datum → Timestamp' },
                ],
            },
            { id: 'timestamp', type: 'text', label: 'Unix-Timestamp', placeholder: '1735689600' },
            { id: 'date', type: 'date', label: 'Datum' },
            { id: 'time', type: 'text', label: 'Uhrzeit', placeholder: '12:00', default: '00:00' },
        ],
        compute: computeUnixTimestamp,
        intro: 'Unix-Epoch in Sekunden (oder Millisekunden bei 13 Stellen). Lokale Zeitzone für Datum→Timestamp.',
    },
    'unix-timestamp',
);
