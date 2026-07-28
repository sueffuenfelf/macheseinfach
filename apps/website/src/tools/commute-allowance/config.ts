import { defineCalcTool } from '../_shared/shells';
import { STEUERN_DISCLAIMER, STEUERN_THEME, STEUERN_TRUST } from '../_shared/steuern';
import { computeCommuteAllowance } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'commute-allowance',
            slug: 'commute-allowance',
            shortTitle: 'Pendlerpauschale',
            title: 'Pendlerpauschale berechnen',
            sub: 'Entfernungspauschale grob — km × Arbeitstage, Sätze 2025/2026.',
            pain: 'Wie hoch ist meine Entfernungspauschale ungefähr?',
            solution: 'Strecke, Tage und Jahr eingeben — Jahresbetrag sofort sehen.',
            trust: STEUERN_TRUST,
            tags: ['Steuern', 'Pauschale', 'Rechnen'],
            keywords: [
                'pendlerpauschale berechnen',
                'entfernungspauschale',
                'pendlerpauschale 2026',
            ],
            fileHints: [],
            command: '/pendler',
            entry: 'form',
            entryPlaceholder: 'km einfache Strecke',
            theme: STEUERN_THEME,
            maturity: 'stable',
            areas: ['steuern'],
            storyIds: [],
        },
        fields: [
            {
                id: 'year',
                type: 'segment',
                label: 'Steuerjahr',
                default: '2026',
                options: [
                    { value: '2025', label: '2025' },
                    { value: '2026', label: '2026' },
                ],
                hint: '2025: Staffelung 0,30/0,38\u00a0€ · 2026: 0,38\u00a0€ ab 1. km',
            },
            {
                id: 'km',
                type: 'number',
                label: 'Einfache Entfernung',
                placeholder: '25',
                suffix: 'km',
            },
            {
                id: 'days',
                type: 'number',
                label: 'Arbeitstage',
                placeholder: '220',
                suffix: 'Tage',
                default: '220',
            },
        ],
        compute: computeCommuteAllowance,
        intro: `Entfernungspauschale für den Weg Wohnung ↔ erste Tätigkeitsstätte. ${STEUERN_DISCLAIMER}`,
    },
    'commute-allowance',
);
