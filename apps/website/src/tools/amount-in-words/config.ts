import { defineCalcTool } from '../_shared/shells';
import { computeAmountInWords } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'amount-in-words',
            slug: 'amount-in-words',
            shortTitle: 'Betrag in Worten',
            title: 'Betrag in Worten',
            sub: 'Euro-Betrag auf Deutsch ausschreiben — für Rechnungen und Verträge.',
            pain: 'Auf der Rechnung soll der Betrag ausgeschrieben stehen — „123,45 EUR“ in Worten.',
            solution: 'Betrag eingeben — der deutsche Wortlaut erscheint sofort.',
            trust: 'Lokal umgewandelt · nichts wird hochgeladen',
            tags: ['Rechnung', 'Freelancer'],
            keywords: ['betrag in worten', 'ausschreiben', 'euro worte', 'rechnung', 'vertrag'],
            fileHints: [],
            command: '/betrag-worte',
            entry: 'form',
            entryPlaceholder: 'Betrag, z. B. 123,45',
            theme: { accent: '#ff90e8', accentStrong: '#000', accentSoft: '#ffe3f7' },
            maturity: 'stable',
            areas: ['buchhaltung'],
            storyIds: [],
        },
        fields: [
            {
                id: 'amount',
                type: 'currency',
                label: 'Betrag',
                placeholder: '123,45',
            },
        ],
        compute: computeAmountInWords,
        intro: 'Schreibt Euro-Beträge auf Deutsch aus — z. B. für Rechnungstexte.',
    },
    'amount-in-words',
);
