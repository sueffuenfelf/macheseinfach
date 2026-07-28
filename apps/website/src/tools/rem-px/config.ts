import { defineCalcTool } from '../_shared/shells';
import { A11Y_THEME, TRUST_LOCAL } from '../_shared/color';
import { computeRemPx } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'rem-px',
            slug: 'rem-px',
            shortTitle: 'rem ↔ px',
            title: 'rem und px umrechnen',
            sub: 'Schriftgrößen barrierearm planen — rem und Pixel mit Basis.',
            pain: 'Design in px, CSS in rem — wie viel ist 1.125 rem?',
            solution: 'Wert und Basis eingeben — Umrechnung live.',
            trust: TRUST_LOCAL,
            tags: ['A11y', 'CSS', 'Umwandeln'],
            keywords: ['rem zu px', 'px zu rem rechner', 'schriftgröße umrechnen'],
            fileHints: [],
            command: '/rem',
            entry: 'form',
            theme: A11Y_THEME,
            maturity: 'stable',
            areas: ['barrierefreiheit', 'kreativ'],
            storyIds: [],
        },
        fields: [
            {
                id: 'mode', type: 'segment', label: 'Richtung', default: 'rem-to-px',
                options: [
                    { value: 'rem-to-px', label: 'rem → px' },
                    { value: 'px-to-rem', label: 'px → rem' },
                ],
            },
            { id: 'value', type: 'number', label: 'Wert', placeholder: '1.125' },
            { id: 'base', type: 'number', label: 'Basis (px)', default: '16', placeholder: '16' },
        ],
        compute: computeRemPx,
    },
    'rem-px',
);
