import { defineCalcTool } from '../_shared/shells';
import { TRUST_LOCAL, WOHNEN_THEME } from '../_shared/wohnen/theme';
import { computeWarmColdRent } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'warm-cold-rent',
            slug: 'warm-cold-rent',
            shortTitle: 'Warm-/Kaltmiete',
            title: 'Warm- und Kaltmiete umrechnen',
            sub: 'Angebote vergleichen — Warmmiete, Kaltmiete und Nebenkosten-Anteil.',
            pain: 'Inserate mischen Warm- und Kaltmiete — schwer vergleichbar.',
            solution: 'Beträge eingeben — Umrechnung lokal im Browser.',
            trust: TRUST_LOCAL,
            tags: ['Miete', 'Nebenkosten', 'Rechnen'],
            keywords: [
                'warmmiete kaltmiete',
                'nebenkosten anteil',
                'miete umrechnen',
                'kaltmiete berechnen',
            ],
            fileHints: [],
            command: '/warmkalt',
            entry: 'form',
            entryPlaceholder: 'Miete …',
            theme: WOHNEN_THEME,
            maturity: 'stable',
            areas: ['wohnen'],
            storyIds: [],
        },
        fields: [
            {
                id: 'mode',
                type: 'segment',
                label: 'Richtung',
                default: 'cold-to-warm',
                options: [
                    { value: 'cold-to-warm', label: 'Kalt → Warm' },
                    { value: 'warm-to-cold', label: 'Warm → Kalt' },
                ],
            },
            {
                id: 'amount',
                type: 'currency',
                label: 'Miete',
                placeholder: '950,00',
            },
            {
                id: 'utilities',
                type: 'currency',
                label: 'Nebenkosten (Vorauszahlung)',
                placeholder: '180,00',
            },
        ],
        compute: computeWarmColdRent,
        intro: TRUST_LOCAL,
    },
    'warm-cold-rent',
);
