import { defineCalcTool } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL, TRUST_LOCAL, WOHNEN_THEME } from '../_shared/wohnen/theme';
import { computeRentIncreaseIndex } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'rent-increase-index',
            slug: 'rent-increase-index',
            shortTitle: 'Indexmiete grob',
            title: 'Indexmiete grob berechnen',
            sub: 'Miete × VPI-/Index-Änderung — grobe Erhöhung, kein Bescheid.',
            pain: 'Indexklausel im Vertrag — wie stark steigt die Miete ungefähr?',
            solution: 'Miete und Prozentänderung eingeben — Ergebnis lokal.',
            trust: TRUST_LOCAL,
            tags: ['Miete', 'Rechnen'],
            keywords: [
                'indexmiete erhöhen',
                'mietindex berechnen',
                'vpi miete',
                'indexklausel miete',
            ],
            fileHints: [],
            command: '/indexmiete',
            entry: 'form',
            entryPlaceholder: 'Miete und Index …',
            theme: WOHNEN_THEME,
            maturity: 'stable',
            areas: ['wohnen'],
            storyIds: [],
        },
        fields: [
            {
                id: 'rent',
                type: 'currency',
                label: 'Aktuelle Miete',
                placeholder: '900,00',
            },
            {
                id: 'changePct',
                type: 'number',
                label: 'Index-Änderung',
                placeholder: '3,5',
                suffix: '%',
                hint: 'Differenz des vereinbarten Indexes in Prozent (z. B. VPI).',
            },
        ],
        compute: computeRentIncreaseIndex,
        intro: `${TRUST_LOCAL} ${DISCLAIMER_NO_LEGAL}`,
    },
    'rent-increase-index',
);
