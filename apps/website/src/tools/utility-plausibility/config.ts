import { defineCalcTool } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL, TRUST_LOCAL, WOHNEN_THEME } from '../_shared/wohnen/theme';
import { computeUtilityPlausibility } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'utility-plausibility',
            slug: 'utility-plausibility',
            shortTitle: 'Nebenkosten-Check',
            title: 'Nebenkosten auf Plausibilität prüfen',
            sub: 'Jahreskosten pro m² grob einordnen — keine Rechtsprüfung.',
            pain: 'Nebenkostenabrechnung wirkt zu hoch — erster Reality-Check.',
            solution: 'Betrag und Fläche eingeben — Orientierungsspanne erscheint lokal.',
            trust: TRUST_LOCAL,
            tags: ['Nebenkosten', 'Miete', 'Prüfen'],
            keywords: [
                'nebenkosten prüfen',
                'nebenkostenabrechnung zu hoch',
                'betriebskosten vergleich',
                'nebenkosten m²',
            ],
            fileHints: [],
            command: '/nebenkosten',
            entry: 'form',
            entryPlaceholder: 'Jahreskosten …',
            theme: WOHNEN_THEME,
            maturity: 'stable',
            areas: ['wohnen'],
            storyIds: [],
        },
        fields: [
            {
                id: 'annual',
                type: 'currency',
                label: 'Nebenkosten (Jahr)',
                placeholder: '1.800,00',
            },
            {
                id: 'sqm',
                type: 'number',
                label: 'Wohnfläche',
                placeholder: '65',
                suffix: 'm²',
            },
            {
                id: 'heating',
                type: 'segment',
                label: 'Heizung (grob)',
                default: 'gas',
                options: [
                    { value: 'gas', label: 'Gas' },
                    { value: 'fern', label: 'Fernwärme' },
                    { value: 'oil', label: 'Öl/sonst.' },
                ],
            },
        ],
        compute: computeUtilityPlausibility,
        intro: `${TRUST_LOCAL} ${DISCLAIMER_NO_LEGAL}`,
    },
    'utility-plausibility',
);
