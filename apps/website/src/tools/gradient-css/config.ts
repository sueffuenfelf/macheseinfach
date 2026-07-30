import { defineGenerateTool } from '../_shared/shells';
import { KREATIV_THEME, TRUST_LOCAL } from '../_shared/color';
import { generateGradientCss } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'gradient-css', slug: 'gradient-css', shortTitle: 'CSS-Gradient',
            title: 'CSS-Gradient Generator',
            sub: 'Linear oder radial — Copy-Paste für CSS.',
            pain: 'Verlauf in CSS schreiben — Syntax merken.',
            solution: 'Zwei Farben wählen — fertiges background generieren.',
            trust: TRUST_LOCAL,
            tags: ['Farbe', 'CSS'],
            keywords: ['css gradient generator', 'verlauf generator', 'linear gradient'],
            fileHints: [], command: '/gradient', entry: 'form', theme: KREATIV_THEME,
            maturity: 'stable', areas: ['kreativ'], storyIds: ['story-gradient-css'],
        },
        fields: [
            { id: 'type', type: 'segment', label: 'Typ', default: 'linear',
              options: [{ value: 'linear', label: 'Linear' }, { value: 'radial', label: 'Radial' }] },
            { id: 'from', type: 'text', label: 'Farbe 1', default: '#9b5de5' },
            { id: 'to', type: 'text', label: 'Farbe 2', default: '#e9c46a' },
            { id: 'angle', type: 'number', label: 'Winkel (°)', default: '135' },
        ],
        generate: generateGradientCss,
        isReady: (v) => Boolean((v.from ?? '').trim() && (v.to ?? '').trim()),
        outputTitle: 'CSS',
    }, 'gradient-css',
);
