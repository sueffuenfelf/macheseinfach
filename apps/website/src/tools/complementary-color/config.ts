import { defineCalcTool } from '../_shared/shells';
import { KREATIV_THEME, TRUST_LOCAL } from '../_shared/color';
import { computeComplementary } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'complementary-color', slug: 'complementary-color', shortTitle: 'Komplementär',
            title: 'Komplementärfarbe finden',
            sub: 'Gegenfarbe für Buttons und Akzente — aus einer Basis.',
            pain: 'Welche Farbe kontrastiert gut zur Markenfarbe?',
            solution: 'Hex/RGB eingeben — Komplementärfarbe live.',
            trust: TRUST_LOCAL,
            tags: ['Farbe', 'Rechnen'],
            keywords: ['komplementärfarbe', 'gegenüberliegende farbe', 'complementary color'],
            fileHints: [], command: '/komplement', entry: 'form', theme: KREATIV_THEME,
            maturity: 'stable', areas: ['kreativ'], storyIds: [],
        },
        fields: [{ id: 'color', type: 'text', label: 'Basisfarbe', placeholder: '#336699' }],
        compute: computeComplementary,
    }, 'complementary-color',
);
