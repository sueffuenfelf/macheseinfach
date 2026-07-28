import { defineCalcTool } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL, TRUST_LOCAL, WOHNEN_THEME } from '../_shared/wohnen/theme';
import { computeRentVsBuy } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'rent-vs-buy',
            slug: 'rent-vs-buy',
            shortTitle: 'Miete vs. Kauf grob',
            title: 'Mieten oder kaufen — grober Vergleich',
            sub: 'Erste Orientierung zu Cash-Flüssen — kein Finanztipp.',
            pain: 'Unsicher, ob Mieten oder Kaufen langfristig „günstiger“ wirkt.',
            solution: 'Zahlen eingeben — grober Vergleich lokal im Browser.',
            trust: TRUST_LOCAL,
            tags: ['Miete', 'Rechnen'],
            keywords: [
                'mieten oder kaufen rechner',
                'miete vs kauf',
                'mieten kaufen vergleich',
            ],
            fileHints: [],
            command: '/miete-kauf',
            entry: 'form',
            entryPlaceholder: 'Miete und Kaufpreis …',
            theme: WOHNEN_THEME,
            maturity: 'stable',
            areas: ['wohnen'],
            storyIds: [],
        },
        fields: [
            {
                id: 'rent',
                type: 'currency',
                label: 'Miete / Monat',
                placeholder: '1.100,00',
            },
            {
                id: 'price',
                type: 'currency',
                label: 'Kaufpreis',
                placeholder: '350.000',
            },
            {
                id: 'equity',
                type: 'currency',
                label: 'Eigenkapital',
                placeholder: '70.000',
                default: '0',
            },
            {
                id: 'years',
                type: 'number',
                label: 'Zeitraum',
                placeholder: '15',
                default: '15',
                suffix: 'Jahre',
            },
            {
                id: 'ratePct',
                type: 'number',
                label: 'Zins (grob)',
                placeholder: '3,5',
                default: '3,5',
                suffix: '%',
            },
        ],
        compute: computeRentVsBuy,
        intro: `${TRUST_LOCAL} ${DISCLAIMER_NO_LEGAL} Keine Finanzberatung.`,
    },
    'rent-vs-buy',
);
