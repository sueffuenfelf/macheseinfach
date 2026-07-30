import { defineCalcTool } from '../_shared/shells';
import { KREATIV_THEME, TRUST_LOCAL } from '../_shared/color';
import { computeTintShade } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'tint-shade', slug: 'tint-shade', shortTitle: 'Tint/Shade',
            title: 'Farbe aufhellen oder abdunkeln',
            sub: 'Hover-Zustände und Varianten aus einer Markenfarbe.',
            pain: 'Brauche hellere/dunklere Variante — schnell.',
            solution: 'Farbe + Prozent — Ergebnis als Hex.',
            trust: TRUST_LOCAL,
            tags: ['Farbe', 'CSS'],
            keywords: ['farbe aufhellen', 'shade tint generator', 'hover farbe'],
            fileHints: [], command: '/tint', entry: 'form', theme: KREATIV_THEME,
            maturity: 'stable', areas: ['kreativ'], storyIds: ['story-farbe-aufhellen'],
        },
        fields: [
            { id: 'mode', type: 'segment', label: 'Modus', default: 'tint',
              options: [{ value: 'tint', label: 'Aufhellen' }, { value: 'shade', label: 'Abdunkeln' }] },
            { id: 'color', type: 'text', label: 'Basisfarbe', placeholder: '#9b5de5' },
            { id: 'amount', type: 'number', label: 'Stärke %', default: '25' },
        ],
        compute: computeTintShade,
    }, 'tint-shade',
);
