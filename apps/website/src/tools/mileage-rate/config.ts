import { defineCalcTool } from '../_shared/shells';
import { STEUERN_DISCLAIMER, STEUERN_THEME, STEUERN_TRUST } from '../_shared/steuern';
import { computeMileageRate } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'mileage-rate',
            slug: 'mileage-rate',
            shortTitle: 'Kilometerpauschale',
            title: 'Kilometerpauschale berechnen',
            sub: 'Dienstreise / betrieblich genutzter Pkw — grob mit 0,30\u00a0€/km.',
            pain: 'Wie viel Kilometerpauschale bei X km Dienstfahrt?',
            solution: 'Kilometer eingeben — Pauschbetrag sofort sehen.',
            trust: STEUERN_TRUST,
            tags: ['Steuern', 'Pauschale', 'Rechnen'],
            keywords: ['kilometerpauschale', '0,30 euro km', 'dienstreise kilometer'],
            fileHints: [],
            command: '/km-pauschale',
            entry: 'form',
            entryPlaceholder: 'Kilometer, z. B. 120',
            theme: STEUERN_THEME,
            maturity: 'stable',
            areas: ['steuern'],
            storyIds: [],
        },
        fields: [
            {
                id: 'km',
                type: 'number',
                label: 'Gefahrene Kilometer',
                placeholder: '120',
                suffix: 'km',
                hint: 'Pauschbetrag 0,30\u00a0€/km (nicht Pendlerpauschale).',
            },
        ],
        compute: computeMileageRate,
        intro: `Orientierung mit dem üblichen Pauschbetrag 0,30\u00a0€/km. ${STEUERN_DISCLAIMER}`,
    },
    'mileage-rate',
);
