import { defineGenerateTool } from '../_shared/shells';
import { KREATIV_THEME, TRUST_LOCAL } from '../_shared/color';
import { generateColorPalette } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'color-palette', slug: 'color-palette', shortTitle: 'Palette',
            title: 'Farbpalette erzeugen',
            sub: 'Fünf harmonische Farben aus einer Basis — zum Kopieren.',
            pain: 'Brauche passende Farben zur Markenfarbe.',
            solution: 'Basisfarbe — Palette + CSS-Variablen generieren.',
            trust: TRUST_LOCAL,
            tags: ['Farbe', 'CSS'],
            keywords: ['farbpalette generator', 'color palette', 'harmonische farben'],
            fileHints: [], command: '/palette', entry: 'form', theme: KREATIV_THEME,
            maturity: 'stable', areas: ['kreativ'], storyIds: [],
        },
        fields: [{ id: 'base', type: 'text', label: 'Basisfarbe', placeholder: '#9b5de5' }],
        generate: generateColorPalette,
        isReady: (v) => Boolean((v.base ?? '').trim()),
        outputTitle: 'Palette',
    }, 'color-palette',
);
