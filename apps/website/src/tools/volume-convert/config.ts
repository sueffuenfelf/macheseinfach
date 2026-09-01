import { defineCalcTool } from '../_shared/shells';
import { EINHEITEN_THEME, EINHEITEN_TRUST } from '../_shared/units';
import { computeVolumeConvert } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'volume-convert',
            slug: 'volume-convert',
            shortTitle: 'Volumen',
            title: 'Volumen umrechnen',
            sub: 'ml, Liter und US-Gallonen — für Rezepte und Getränke.',
            pain: 'Rezept in Cups/Gallonen — wie viel Liter?',
            solution: 'Wert und Einheiten wählen — Ergebnis sofort.',
            trust: EINHEITEN_TRUST,
            tags: ['Umwandeln'],
            keywords: ['liter in gallon', 'volumen umrechnen', 'ml liter', 'gallone liter'],
            fileHints: [],
            command: '/volumen',
            entry: 'form',
            entryPlaceholder: 'z. B. 500',
            theme: EINHEITEN_THEME,
            maturity: 'stable',
            areas: ['einheiten'],
        },
        fields: [
            {
                id: 'value',
                type: 'number',
                label: 'Wert',
                placeholder: 'z. B. 500',
            },
            {
                id: 'from',
                type: 'segment',
                label: 'Von',
                default: 'l',
                options: [
                    { value: 'ml', label: 'ml' },
                    { value: 'l', label: 'l' },
                    { value: 'gal', label: 'gal (US)' },
                ],
            },
            {
                id: 'to',
                type: 'segment',
                label: 'Nach',
                default: 'gal',
                options: [
                    { value: 'ml', label: 'ml' },
                    { value: 'l', label: 'l' },
                    { value: 'gal', label: 'gal (US)' },
                ],
            },
        ],
        compute: computeVolumeConvert,
        intro: 'Milliliter, Liter und US-Gallonen — z. B. Rezepte aus dem englischsprachigen Netz.',
    },
    'volume-convert',
);
