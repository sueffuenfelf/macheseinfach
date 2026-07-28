import { defineCalcTool } from '../_shared/shells';
import { STEUERN_DISCLAIMER, STEUERN_THEME, STEUERN_TRUST } from '../_shared/steuern';
import { computeTradeTaxHebesatz } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'trade-tax-hebesatz',
            slug: 'trade-tax-hebesatz',
            shortTitle: 'Gewerbesteuer grob',
            title: 'Gewerbesteuer mit Hebesatz',
            sub: 'Gewinn × Steuermesszahl × Hebesatz — grobe Orientierung, kein Bescheid.',
            pain: 'Wie hoch ist die Gewerbesteuer ungefähr bei meinem Hebesatz?',
            solution: 'Gewinn und Hebesatz eingeben — grobe Steuerlast sofort sehen.',
            trust: STEUERN_TRUST,
            tags: ['Steuern', 'Freelancer', 'Rechnen'],
            keywords: ['gewerbesteuer berechnen', 'hebesatz rechner', 'gewerbesteuer hebesatz'],
            fileHints: [],
            command: '/gewerbesteuer',
            entry: 'form',
            entryPlaceholder: 'Gewinn, z. B. 50.000',
            theme: STEUERN_THEME,
            maturity: 'stable',
            areas: ['steuern'],
            storyIds: [],
        },
        fields: [
            {
                id: 'profit',
                type: 'currency',
                label: 'Gewinn / Gewerbeertrag',
                placeholder: '50.000,00',
            },
            {
                id: 'hebesatz',
                type: 'number',
                label: 'Hebesatz',
                placeholder: '400',
                suffix: '%',
                default: '400',
                hint: 'Gemeinde-Hebesatz, z. B. 400 %.',
            },
            {
                id: 'entity',
                type: 'segment',
                label: 'Rechtsform',
                default: 'sole',
                options: [
                    { value: 'sole', label: 'Einzel / PersG' },
                    { value: 'corp', label: 'Kapitalgesellschaft' },
                ],
                hint: 'Freibetrag 24.500\u00a0€ nur bei Einzelunternehmen/Personengesellschaft.',
            },
        ],
        compute: computeTradeTaxHebesatz,
        intro: `Steuermesszahl 3,5\u00a0% × Hebesatz. ${STEUERN_DISCLAIMER}`,
    },
    'trade-tax-hebesatz',
);
