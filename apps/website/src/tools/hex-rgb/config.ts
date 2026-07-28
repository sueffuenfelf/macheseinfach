import { defineCalcTool } from '../_shared/shells';
import { KREATIV_THEME, TRUST_LOCAL } from '../_shared/color';
import { computeHexRgb } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'hex-rgb', slug: 'hex-rgb', shortTitle: 'Hex ↔ RGB',
            title: 'Hex und RGB umrechnen',
            sub: 'Farbcode zwischen CSS Hex und rgb() — live im Browser.',
            pain: 'Design-Tool zeigt Hex, CSS braucht rgb().',
            solution: 'Wert einfügen — Gegenformat sofort sehen.',
            trust: TRUST_LOCAL,
            tags: ['Farbe', 'CSS', 'Umwandeln'],
            keywords: ['hex to rgb', 'rgb zu hex', 'farbcode umrechner'],
            fileHints: [], command: '/hex', entry: 'form', theme: KREATIV_THEME,
            maturity: 'stable', areas: ['kreativ'], storyIds: [],
        },
        fields: [
            { id: 'mode', type: 'segment', label: 'Richtung', default: 'hex-to-rgb',
              options: [{ value: 'hex-to-rgb', label: 'Hex → RGB' }, { value: 'rgb-to-hex', label: 'RGB → Hex' }] },
            { id: 'input', type: 'text', label: 'Farbe', placeholder: '#336699' },
        ],
        compute: computeHexRgb,
    }, 'hex-rgb',
);
