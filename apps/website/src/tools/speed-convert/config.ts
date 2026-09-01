import { defineCalcTool } from '../_shared/shells';
import { EINHEITEN_THEME, EINHEITEN_TRUST } from '../_shared/units';
import { computeSpeedConvert } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'speed-convert',
            slug: 'speed-convert',
            shortTitle: 'Geschwindigkeit',
            title: 'Geschwindigkeit umrechnen',
            sub: 'km/h und mph — für Autofahren im Ausland.',
            pain: 'Tacho zeigt mph — wie schnell bin ich in km/h?',
            solution: 'Wert eingeben — Umrechnung sofort.',
            trust: EINHEITEN_TRUST,
            tags: ['Umwandeln'],
            keywords: ['kmh in mph', 'geschwindigkeit umrechnen', 'mph kmh', 'meilen pro stunde'],
            fileHints: [],
            command: '/geschwindigkeit',
            entry: 'form',
            entryPlaceholder: 'z. B. 100',
            theme: EINHEITEN_THEME,
            maturity: 'stable',
            areas: ['einheiten'],
        },
        fields: [
            {
                id: 'value',
                type: 'number',
                label: 'Wert',
                placeholder: 'z. B. 100',
            },
            {
                id: 'from',
                type: 'segment',
                label: 'Von',
                default: 'kmh',
                options: [
                    { value: 'kmh', label: 'km/h' },
                    { value: 'mph', label: 'mph' },
                ],
            },
            {
                id: 'to',
                type: 'segment',
                label: 'Nach',
                default: 'mph',
                options: [
                    { value: 'kmh', label: 'km/h' },
                    { value: 'mph', label: 'mph' },
                ],
            },
        ],
        compute: computeSpeedConvert,
        intro: 'km/h ↔ mph — z. B. Mietwagen im USA oder UK.',
    },
    'speed-convert',
);
