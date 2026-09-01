import { defineCalcTool } from '../_shared/shells';
import { EINHEITEN_THEME, EINHEITEN_TRUST } from '../_shared/units';
import { computeFractionDecimal } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'fraction-decimal',
            slug: 'fraction-decimal',
            shortTitle: 'Bruch ↔ Dezimal',
            title: 'Bruch und Dezimalzahl umwandeln',
            sub: 'Brüche in Dezimalzahlen und zurück — für Schule und Rezepte.',
            pain: 'Rezept sagt ⅔ Tasse — wie viel ist das als Zahl?',
            solution: 'Modus wählen, Wert eingeben — Ergebnis sofort.',
            trust: EINHEITEN_TRUST,
            tags: ['Umwandeln'],
            keywords: [
                'bruch in dezimal',
                'dezimal in bruch',
                'bruch umrechnen',
                'dezimalzahl bruch',
            ],
            fileHints: [],
            command: '/bruch',
            entry: 'form',
            entryPlaceholder: 'z. B. 3/4',
            theme: EINHEITEN_THEME,
            maturity: 'stable',
            areas: ['einheiten'],
        },
        fields: [
            {
                id: 'mode',
                type: 'segment',
                label: 'Modus',
                default: 'to-decimal',
                options: [
                    { value: 'to-decimal', label: '→ Dezimal' },
                    { value: 'to-fraction', label: '→ Bruch' },
                ],
            },
            {
                id: 'input',
                type: 'text',
                label: 'Eingabe',
                placeholder: 'z. B. 3/4 oder 0,75',
            },
        ],
        compute: computeFractionDecimal,
        intro: 'Brüche wie 3/4 oder 1 1/2 — oder Dezimalzahlen mit Komma.',
    },
    'fraction-decimal',
);
