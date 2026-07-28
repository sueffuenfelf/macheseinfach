import { defineCalcTool } from '../_shared/shells';
import { STEUERN_DISCLAIMER, STEUERN_THEME, STEUERN_TRUST } from '../_shared/steuern';
import { computeExpenseRatio } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'expense-ratio',
            slug: 'expense-ratio',
            shortTitle: 'Betriebsausgaben-Quote',
            title: 'Betriebsausgaben-Quote',
            sub: 'Ausgaben geteilt durch Einnahmen — Kostenquote für Freelancer-Alltag.',
            pain: 'Wie hoch ist meine Kostenquote ungefähr?',
            solution: 'Einnahmen und Ausgaben eingeben — Quote und Überschuss sofort sehen.',
            trust: STEUERN_TRUST,
            tags: ['Steuern', 'Freelancer', 'Rechnen'],
            keywords: [
                'betriebsausgaben quote',
                'kostenquote freiberufler',
                'ausgaben einnahmen quote',
            ],
            fileHints: [],
            command: '/kostenquote',
            entry: 'form',
            entryPlaceholder: 'Einnahmen',
            theme: STEUERN_THEME,
            maturity: 'stable',
            areas: ['steuern', 'buchhaltung'],
            storyIds: [],
        },
        fields: [
            {
                id: 'income',
                type: 'currency',
                label: 'Einnahmen / Umsatz',
                placeholder: '60.000,00',
            },
            {
                id: 'expenses',
                type: 'currency',
                label: 'Betriebsausgaben',
                placeholder: '18.000,00',
            },
        ],
        compute: computeExpenseRatio,
        intro: `Kostenquote = Ausgaben ÷ Einnahmen. ${STEUERN_DISCLAIMER}`,
    },
    'expense-ratio',
);
