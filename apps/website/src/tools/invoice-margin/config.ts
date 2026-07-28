import { defineCalcTool } from '../_shared/shells';
import { STEUERN_DISCLAIMER, STEUERN_THEME, STEUERN_TRUST } from '../_shared/steuern';
import { computeInvoiceMargin } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'invoice-margin',
            slug: 'invoice-margin',
            shortTitle: 'Verkaufskalkulation',
            title: 'Verkaufspreis kalkulieren',
            sub: 'EK → Marge → Netto/Brutto inkl. MwSt — für schnelle Handelsspannen.',
            pain: 'Welchen VK brauche ich bei X % Marge inkl. MwSt?',
            solution: 'EK, Marge und MwSt wählen — Netto und Brutto sofort sehen.',
            trust: STEUERN_TRUST,
            tags: ['Steuern', 'MwSt', 'Rechnung', 'Rechnen'],
            keywords: [
                'verkaufspreis kalkulieren',
                'handelsspanne berechnen',
                'ek vk marge',
            ],
            fileHints: [],
            command: '/kalkulation',
            entry: 'form',
            entryPlaceholder: 'Einkaufspreis',
            theme: STEUERN_THEME,
            maturity: 'stable',
            areas: ['steuern', 'buchhaltung'],
            storyIds: [],
        },
        fields: [
            {
                id: 'cost',
                type: 'currency',
                label: 'Einkaufspreis (EK)',
                placeholder: '100,00',
            },
            {
                id: 'margin',
                type: 'number',
                label: 'Marge',
                placeholder: '30',
                suffix: '%',
                default: '30',
            },
            {
                id: 'vat',
                type: 'segment',
                label: 'MwSt',
                default: '19',
                options: [
                    { value: '19', label: '19\u00a0%' },
                    { value: '7', label: '7\u00a0%' },
                    { value: '0', label: '0\u00a0%' },
                ],
            },
        ],
        compute: computeInvoiceMargin,
        intro: `EK plus prozentuale Marge, danach MwSt. ${STEUERN_DISCLAIMER}`,
    },
    'invoice-margin',
);
