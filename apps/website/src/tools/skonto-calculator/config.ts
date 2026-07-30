import { defineCalcTool } from '../_shared/shells';
import { computeSkonto } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'skonto-calculator',
            slug: 'skonto-calculator',
            shortTitle: 'Skonto-Rechner',
            title: 'Skonto-Rechner',
            sub: 'Skontobetrag und Zahlbetrag nach Skontoabzug — live im Browser.',
            pain: 'Auf der Rechnung steht „2\u00a0% Skonto bei Zahlung innerhalb von 10 Tagen“ — wie viel spare ich?',
            solution: 'Rechnungsbetrag und Skontosatz eingeben — Skonto und Zahlbetrag erscheinen sofort.',
            trust: 'Lokal gerechnet · nichts wird hochgeladen',
            tags: ['Rechnung', 'Freelancer'],
            keywords: ['skonto', 'skontorechner', 'zahlungsbetrag', 'rabatt', 'rechnung', '2 prozent'],
            fileHints: [],
            command: '/skonto',
            entry: 'form',
            entryPlaceholder: 'Rechnungsbetrag, z. B. 1.000,00',
            theme: { accent: '#ff90e8', accentStrong: '#000', accentSoft: '#ffe3f7' },
            maturity: 'stable',
            areas: ['buchhaltung'],
            storyIds: ['story-skonto-rechnung'],
        },
        fields: [
            {
                id: 'amount',
                type: 'currency',
                label: 'Rechnungsbetrag',
                placeholder: '1.000,00',
            },
            {
                id: 'rate',
                type: 'number',
                label: 'Skontosatz',
                placeholder: '2',
                suffix: '%',
                default: '2',
            },
        ],
        compute: computeSkonto,
        intro: 'Berechnet den Skontoabzug und den Betrag, den du überweisen musst.',
    },
    'skonto-calculator',
);
