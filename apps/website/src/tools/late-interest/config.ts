import { defineCalcTool } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL, RECHT_THEME, TRUST_LOCAL } from '../_shared/recht/theme';
import { computeLateInterest } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'late-interest',
            slug: 'late-interest',
            shortTitle: 'Verzugszinsen',
            title: 'Verzugszinsen grob berechnen',
            sub: 'Überfällige Rechnung — Zinsen zur groben Orientierung.',
            pain: 'Rechnung ist überfällig — wie hoch sind Verzugszinsen ungefähr?',
            solution: 'Betrag, Tage und Zinssatz eingeben — Zinsen und Summe anzeigen.',
            trust: TRUST_LOCAL,
            tags: ['Recht', 'Rechnung', 'Rechnen'],
            keywords: ['verzugszinsen berechnen', 'verzugszinssatz', 'überfällige rechnung zinsen'],
            fileHints: [],
            command: '/verzugszinsen',
            entry: 'form',
            entryPlaceholder: 'Betrag und Tage',
            theme: RECHT_THEME,
            maturity: 'stable',
            areas: ['recht'],
            storyIds: [],
        },
        fields: [
            { id: 'amount', type: 'currency', label: 'Forderungsbetrag', placeholder: '1.000,00' },
            { id: 'days', type: 'number', label: 'Tage im Verzug', default: '30', suffix: 'Tage' },
            {
                id: 'ratePercent',
                type: 'number',
                label: 'Zinssatz p. a.',
                default: '8,12',
                suffix: '%',
                hint: 'Orientierung: Basiszins + Aufschlag — je nach Vertrag/Verhältnis.',
            },
        ],
        compute: computeLateInterest,
        intro: `${DISCLAIMER_NO_LEGAL} Vereinfachte Zinsformel ohne Hemmung oder Verzugsbeginn.`,
    },
    'late-interest',
);
