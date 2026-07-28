import { defineCalcTool } from '../_shared/shells';
import { TRUST_LOCAL, WOHNEN_THEME } from '../_shared/wohnen/theme';
import { computeParkingSpaceRent } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'parking-space-rent',
            slug: 'parking-space-rent',
            shortTitle: 'Stellplatz-Anteil',
            title: 'Stellplatz- / Garagenanteil',
            sub: 'Wie viel vom Mietpreis grob auf den Stellplatz entfällt.',
            pain: 'Unklar, was ein Stellplatz im Mietpreis „wert“ ist.',
            solution: 'Miete und Anteil oder Festpreis eingeben — Ergebnis lokal.',
            trust: TRUST_LOCAL,
            tags: ['Miete', 'Rechnen'],
            keywords: [
                'stellplatz miete anteil',
                'garagenmiete üblich',
                'parkplatz miete',
                'tiefgarage miete',
            ],
            fileHints: [],
            command: '/stellplatz',
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
                label: 'Modus',
                default: 'share',
                options: [
                    { value: 'share', label: '% von Miete' },
                    { value: 'fixed', label: 'Festpreis → %' },
                ],
            },
            {
                id: 'rent',
                type: 'currency',
                label: 'Miete gesamt',
                placeholder: '1.200,00',
            },
            {
                id: 'pct',
                type: 'number',
                label: 'Anteil',
                placeholder: '8',
                default: '8',
                suffix: '%',
                hint: 'Nur bei „% von Miete“.',
            },
            {
                id: 'garage',
                type: 'currency',
                label: 'Stellplatz-Miete',
                placeholder: '80,00',
                hint: 'Nur bei „Festpreis → %“.',
            },
        ],
        compute: computeParkingSpaceRent,
        intro: TRUST_LOCAL,
    },
    'parking-space-rent',
);
