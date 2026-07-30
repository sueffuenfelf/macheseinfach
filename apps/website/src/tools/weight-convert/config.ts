import { defineCalcTool } from '../_shared/shells';
import { EINHEITEN_THEME, EINHEITEN_TRUST } from '../_shared/units';
import { computeWeightConvert } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'weight-convert',
            slug: 'weight-convert',
            shortTitle: 'Gewicht',
            title: 'Gewicht umrechnen',
            sub: 'g, kg, Pfund und Unzen — für Rezepte, Pakete und Reisen.',
            pain: 'Angabe in Pfund — wie viel ist das in kg?',
            solution: 'Wert und Einheiten wählen — Ergebnis sofort.',
            trust: EINHEITEN_TRUST,
            tags: ['Umwandeln'],
            keywords: ['kg in pfund', 'gewicht umrechnen', 'pfund kg', 'unzen gramm'],
            fileHints: [],
            command: '/gewicht',
            entry: 'form',
            entryPlaceholder: 'z. B. 75',
            theme: EINHEITEN_THEME,
            maturity: 'stable',
            areas: ['einheiten'],
            storyIds: ['story-gewicht-umrechnen'],
        },
        fields: [
            {
                id: 'value',
                type: 'number',
                label: 'Wert',
                placeholder: 'z. B. 75',
            },
            {
                id: 'from',
                type: 'segment',
                label: 'Von',
                default: 'kg',
                options: [
                    { value: 'g', label: 'g' },
                    { value: 'kg', label: 'kg' },
                    { value: 'lb', label: 'Pfund' },
                    { value: 'oz', label: 'Unze' },
                ],
            },
            {
                id: 'to',
                type: 'segment',
                label: 'Nach',
                default: 'lb',
                options: [
                    { value: 'g', label: 'g' },
                    { value: 'kg', label: 'kg' },
                    { value: 'lb', label: 'Pfund' },
                    { value: 'oz', label: 'Unze' },
                ],
            },
        ],
        compute: computeWeightConvert,
        intro: 'Metrisch und US/imperial — z. B. Kofferlimit, Rezepte aus dem Netz.',
    },
    'weight-convert',
);
