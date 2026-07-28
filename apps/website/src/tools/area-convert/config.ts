import { defineCalcTool } from '../_shared/shells';
import { EINHEITEN_THEME, EINHEITEN_TRUST } from '../_shared/units';
import { computeAreaConvert } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'area-convert',
            slug: 'area-convert',
            shortTitle: 'Fläche',
            title: 'Fläche umrechnen',
            sub: 'm², Hektar und Quadratfuß — für Grundstücke und Wohnfläche.',
            pain: 'Anzeige in ft² — wie viel Quadratmeter sind das?',
            solution: 'Wert und Einheiten wählen — Ergebnis live.',
            trust: EINHEITEN_TRUST,
            tags: ['Umwandeln'],
            keywords: ['quadratmeter hektar', 'fläche umrechnen', 'm2 ft2', 'wohnfläche'],
            fileHints: [],
            command: '/flaeche',
            entry: 'form',
            entryPlaceholder: 'z. B. 85',
            theme: EINHEITEN_THEME,
            maturity: 'stable',
            areas: ['einheiten'],
            storyIds: [],
        },
        fields: [
            {
                id: 'value',
                type: 'number',
                label: 'Wert',
                placeholder: 'z. B. 85',
            },
            {
                id: 'from',
                type: 'segment',
                label: 'Von',
                default: 'm2',
                options: [
                    { value: 'm2', label: 'm²' },
                    { value: 'ha', label: 'ha' },
                    { value: 'ft2', label: 'ft²' },
                ],
            },
            {
                id: 'to',
                type: 'segment',
                label: 'Nach',
                default: 'ha',
                options: [
                    { value: 'm2', label: 'm²' },
                    { value: 'ha', label: 'ha' },
                    { value: 'ft2', label: 'ft²' },
                ],
            },
        ],
        compute: computeAreaConvert,
        intro: 'Quadratmeter, Hektar und Quadratfuß — z. B. Wohnungsanzeige, Grundstück.',
    },
    'area-convert',
);
