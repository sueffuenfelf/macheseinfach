import { defineCalcTool } from '../_shared/shells';
import { EINHEITEN_THEME, EINHEITEN_TRUST } from '../_shared/units';
import { computeTempConvert } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'temp-convert',
            slug: 'temp-convert',
            shortTitle: 'Temperatur',
            title: 'Temperatur umrechnen',
            sub: '°C, °F und Kelvin — für Rezepte, Reisen und Technik.',
            pain: 'Ofen zeigt °F — wie viel ist das in °C?',
            solution: 'Wert eingeben, Skala wählen — Ergebnis live.',
            trust: EINHEITEN_TRUST,
            tags: ['Umwandeln'],
            keywords: ['celsius fahrenheit', 'temperatur umrechnen', 'f in c', 'kelvin'],
            fileHints: [],
            command: '/temperatur',
            entry: 'form',
            entryPlaceholder: 'z. B. 180',
            theme: EINHEITEN_THEME,
            maturity: 'stable',
            areas: ['einheiten'],
            storyIds: ['story-temperatur'],
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
                default: 'c',
                options: [
                    { value: 'c', label: '°C' },
                    { value: 'f', label: '°F' },
                    { value: 'k', label: 'K' },
                ],
            },
            {
                id: 'to',
                type: 'segment',
                label: 'Nach',
                default: 'f',
                options: [
                    { value: 'c', label: '°C' },
                    { value: 'f', label: '°F' },
                    { value: 'k', label: 'K' },
                ],
            },
        ],
        compute: computeTempConvert,
        intro: 'Celsius, Fahrenheit und Kelvin — z. B. Backofen, Wetter, Reisen.',
    },
    'temp-convert',
);
