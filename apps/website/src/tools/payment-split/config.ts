import { defineCalcTool } from '../_shared/shells';
import { computePaymentSplit } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'payment-split',
            slug: 'payment-split',
            shortTitle: 'Teilzahlungen',
            title: 'Teilzahlungen aufteilen',
            sub: 'Gesamtbetrag gleichmäßig auf N Überweisungen verteilen — centgenau.',
            pain: 'Eine Rechnung soll in mehreren Raten bezahlt werden — wie hoch ist jede Überweisung?',
            solution: 'Gesamtbetrag und Anzahl Raten eingeben — Aufteilung erscheint sofort.',
            trust: 'Lokal berechnet · nichts wird hochgeladen',
            tags: ['Rechnung', 'Bank'],
            keywords: ['teilzahlung', 'raten', 'aufteilen', 'überweisung', 'ratenzahlung', 'split'],
            fileHints: [],
            command: '/teilzahlung',
            entry: 'form',
            entryPlaceholder: 'Betrag, z. B. 1.200,00',
            theme: { accent: '#ff90e8', accentStrong: '#000', accentSoft: '#ffe3f7' },
            maturity: 'stable',
            areas: ['buchhaltung'],
            storyIds: [],
        },
        fields: [
            {
                id: 'amount',
                type: 'currency',
                label: 'Gesamtbetrag',
                placeholder: '1.200,00',
            },
            {
                id: 'count',
                type: 'number',
                label: 'Anzahl Raten',
                placeholder: '3',
                default: '3',
            },
        ],
        compute: computePaymentSplit,
        intro: 'Teilt einen Betrag centgenau auf mehrere Überweisungen auf.',
    },
    'payment-split',
);
