import { defineCalcTool } from '../_shared/shells';
import { EINHEITEN_THEME, EINHEITEN_TRUST } from '../_shared/units';
import { computeLengthConvert } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'length-convert',
            slug: 'length-convert',
            shortTitle: 'Länge',
            title: 'Längen umrechnen',
            sub: 'cm, m, km, Zoll und Fuß — schnell und lokal.',
            pain: 'Maßangabe in Zoll — wie viel ist das in cm?',
            solution: 'Wert eingeben, Einheiten wählen — Ergebnis live.',
            trust: EINHEITEN_TRUST,
            tags: ['Umwandeln'],
            keywords: ['cm in zoll', 'meter umrechnen', 'längen umrechner', 'fuß cm'],
            fileHints: [],
            command: '/laenge',
            entry: 'form',
            entryPlaceholder: 'z. B. 180',
            theme: EINHEITEN_THEME,
            maturity: 'stable',
            areas: ['einheiten'],
        },
        fields: [
            {
                id: 'value',
                type: 'number',
                label: 'Wert',
                placeholder: 'z. B. 180',
            },
            {
                id: 'from',
                type: 'segment',
                label: 'Von',
                default: 'cm',
                options: [
                    { value: 'cm', label: 'cm' },
                    { value: 'm', label: 'm' },
                    { value: 'km', label: 'km' },
                    { value: 'inch', label: 'Zoll' },
                    { value: 'ft', label: 'Fuß' },
                ],
            },
            {
                id: 'to',
                type: 'segment',
                label: 'Nach',
                default: 'm',
                options: [
                    { value: 'cm', label: 'cm' },
                    { value: 'm', label: 'm' },
                    { value: 'km', label: 'km' },
                    { value: 'inch', label: 'Zoll' },
                    { value: 'ft', label: 'Fuß' },
                ],
            },
        ],
        compute: computeLengthConvert,
        intro: 'Metrisch und imperial — z. B. Körpergröße, Reisen, Online-Shopping.',
    },
    'length-convert',
);
