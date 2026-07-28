import { defineCalcTool } from '../_shared/shells';
import { STEUERN_DISCLAIMER, STEUERN_THEME, STEUERN_TRUST } from '../_shared/steuern';
import { computeSolidaritySurcharge } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'solidarity-surcharge',
            slug: 'solidarity-surcharge',
            shortTitle: 'Soli grob',
            title: 'Solidaritätszuschlag-Hinweis',
            sub: 'Ob Soli grob anfällt — Freigrenze nach Steuerjahr und Veranlagung.',
            pain: 'Fällt bei meiner Einkommensteuer noch Soli an?',
            solution: 'ESt und Veranlagung eingeben — Freigrenze und groben Soli sehen.',
            trust: STEUERN_TRUST,
            tags: ['Steuern', 'Prüfen', 'Rechnen'],
            keywords: ['soli berechnen', 'solidaritätszuschlag', 'soli freigrenze'],
            fileHints: [],
            command: '/soli',
            entry: 'form',
            entryPlaceholder: 'Festgesetzte ESt',
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
            },
            {
                id: 'filing',
                type: 'segment',
                label: 'Veranlagung',
                default: 'single',
                options: [
                    { value: 'single', label: 'Einzel' },
                    { value: 'joint', label: 'Zusammen' },
                ],
            },
            {
                id: 'incomeTax',
                type: 'currency',
                label: 'Festgesetzte Einkommensteuer',
                placeholder: '18.000,00',
                hint: 'Nicht das Bruttogehalt — die ESt laut Bescheid/Vorauszahlung.',
            },
        ],
        compute: computeSolidaritySurcharge,
        intro: `Freigrenzen 2025/2026, Satz 5,5\u00a0%. Milderungszone nicht enthalten. ${STEUERN_DISCLAIMER}`,
    },
    'solidarity-surcharge',
);
