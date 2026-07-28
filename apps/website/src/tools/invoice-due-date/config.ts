import { defineCalcTool } from '../_shared/shells';
import { computeInvoiceDueDate } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'invoice-due-date',
            slug: 'invoice-due-date',
            shortTitle: 'Fälligkeit',
            title: 'Rechnungsfälligkeit berechnen',
            sub: 'Rechnungsdatum und Zahlungsziel → Fälligkeitsdatum — live im Browser.',
            pain: 'Auf der Rechnung steht „zahlbar innerhalb von 14 Tagen“ — wann ist die Frist?',
            solution: 'Rechnungsdatum und Zahlungsziel eingeben — Fälligkeit erscheint sofort.',
            trust: 'Lokal berechnet · nichts wird hochgeladen',
            tags: ['Rechnung', 'Freelancer'],
            keywords: ['fälligkeit', 'zahlungsziel', 'rechnung', 'zahlungsfrist', '14 tage', '30 tage'],
            fileHints: [],
            command: '/faelligkeit',
            entry: 'form',
            entryPlaceholder: 'Rechnungsdatum wählen',
            theme: { accent: '#ff90e8', accentStrong: '#000', accentSoft: '#ffe3f7' },
            maturity: 'stable',
            areas: ['buchhaltung'],
            storyIds: [],
        },
        fields: [
            {
                id: 'invoiceDate',
                type: 'date',
                label: 'Rechnungsdatum',
            },
            {
                id: 'termDays',
                type: 'number',
                label: 'Zahlungsziel',
                placeholder: '14',
                suffix: 'Tage',
                default: '14',
            },
        ],
        compute: computeInvoiceDueDate,
        intro: 'Berechnet das Fälligkeitsdatum aus Rechnungsdatum und Zahlungsziel in Kalendertagen.',
    },
    'invoice-due-date',
);
