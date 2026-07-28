import { defineCalcTool } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL, TRUST_LOCAL, WOHNEN_THEME } from '../_shared/wohnen/theme';
import { computeDeposit } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'deposit-calc',
            slug: 'deposit-calc',
            shortTitle: 'Kaution rechnen',
            title: 'Mietkaution berechnen',
            sub: 'Wie hoch darf die Kaution sein — 3 Kaltmieten und Ratenzahlung grob.',
            pain: 'Unklar, ob die geforderte Kaution üblich und zulässig ist.',
            solution: 'Kaltmiete eingeben — Maximalbetrag und Raten erscheinen sofort.',
            trust: TRUST_LOCAL,
            tags: ['Miete', 'Kaution', 'Rechnen'],
            keywords: [
                'kaution berechnen',
                'mietkaution höhe',
                '3 monatsmieten kaution',
                'kaution rate',
            ],
            fileHints: [],
            command: '/kaution',
            entry: 'form',
            entryPlaceholder: 'Kaltmiete …',
            theme: WOHNEN_THEME,
            maturity: 'stable',
            areas: ['wohnen'],
            storyIds: [],
        },
        fields: [
            {
                id: 'cold',
                type: 'currency',
                label: 'Kaltmiete (monatlich)',
                placeholder: '850,00',
            },
        ],
        compute: computeDeposit,
        intro: `${TRUST_LOCAL} ${DISCLAIMER_NO_LEGAL}`,
    },
    'deposit-calc',
);
