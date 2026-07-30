import { defineCalcTool } from '../_shared/shells';
import { computePercent } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'percent-calc',
            slug: 'percent-calc',
            shortTitle: 'Prozentrechner',
            title: 'Prozentrechner',
            sub: 'X % von Y, Anteil in %, oder Änderung von A nach B.',
            pain: 'Rabatt, Anteil oder Steigerung — Formel unsicher.',
            solution: 'Modus wählen, Zahlen eingeben — Ergebnis live.',
            trust: 'Lokal gerechnet · nichts wird hochgeladen',
            tags: ['Zähler'],
            keywords: [
                'prozentrechner',
                'prozent berechnen',
                'wieviel Prozent',
                'prozent von',
                'prozentuale änderung',
            ],
            fileHints: [],
            command: '/prozent',
            entry: 'form',
            entryPlaceholder: 'Zahlen …',
            theme: { accent: '#a8dadc', accentStrong: '#000', accentSoft: '#e8f6f7' },
            maturity: 'stable',
            areas: ['einheiten'],
            storyIds: ['story-prozent'],
        },
        fields: [
            {
                id: 'mode',
                type: 'segment',
                label: 'Modus',
                default: 'of',
                options: [
                    { value: 'of', label: '% von' },
                    { value: 'is', label: 'ist %' },
                    { value: 'change', label: 'Änderung' },
                ],
            },
            {
                id: 'a',
                type: 'number',
                label: 'Wert A',
                placeholder: 'z. B. 19',
            },
            {
                id: 'b',
                type: 'number',
                label: 'Wert B',
                placeholder: 'z. B. 100',
            },
        ],
        compute: computePercent,
        intro: '% von: A % von B · ist %: A ist wieviel % von B · Änderung: von A nach B.',
    },
    'percent-calc',
);
