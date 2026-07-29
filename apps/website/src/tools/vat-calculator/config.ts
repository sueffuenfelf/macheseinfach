import { defineCalcTool } from '../_shared/shells';
import { computeVat } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'vat-calculator',
            slug: 'vat-calculator',
            shortTitle: 'MwSt-Rechner',
            title: 'MwSt-Rechner',
            sub: 'Brutto, Netto und Mehrwertsteuer live umrechnen — 19 % oder 7 %.',
            pain: 'Rechnung schreiben und unsicher, was Netto und MwSt sind.',
            solution: 'Betrag eingeben, Richtung wählen — Ergebnis erscheint sofort im Browser.',
            trust: 'Lokal gerechnet · nichts wird hochgeladen · keine Steuerberatung',
            tags: ['Rechnung', 'Freelancer', 'MwSt', 'Steuern'],
            keywords: ['mwst', 'mehrwertsteuer', 'ust', 'brutto', 'netto', 'rechner', '19', '7', 'mwst rausrechnen'],
            fileHints: [],
            command: '/mwst',
            entry: 'form',
            entryPlaceholder: 'Betrag, z. B. 119,00',
            theme: { accent: '#ff90e8', accentStrong: '#000', accentSoft: '#ffe3f7' },
            maturity: 'stable',
            areas: ['buchhaltung', 'steuern'],
            storyIds: ['story-freelancer-zahlung', 'story-mwst-steuer'],
        },
        fields: [
            {
                id: 'amount',
                type: 'currency',
                label: 'Betrag',
                placeholder: '119,00',
            },
            {
                id: 'mode',
                type: 'segment',
                label: 'Richtung',
                default: 'gross-to-net',
                options: [
                    { value: 'gross-to-net', label: 'Brutto → Netto' },
                    { value: 'net-to-gross', label: 'Netto → Brutto' },
                ],
            },
            {
                id: 'rate',
                type: 'segment',
                label: 'MwSt',
                default: '19',
                options: [
                    { value: '19', label: '19 %' },
                    { value: '7', label: '7 %' },
                ],
            },
        ],
        compute: computeVat,
        intro: 'Beträge bleiben in deinem Browser. Vereinfachte Rechnung — keine Steuerberatung.',
    },
    'vat-calculator',
);
