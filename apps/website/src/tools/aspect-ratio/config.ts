import { defineCalcTool } from '../_shared/shells';
import { KREATIV_THEME, TRUST_LOCAL } from '../_shared/color';
import { computeAspectRatio } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'aspect-ratio', slug: 'aspect-ratio', shortTitle: 'Seitenverhältnis',
            title: 'Seitenverhältnis berechnen',
            sub: '16:9, 4:3 und eigene Formate — Pixel und CSS aspect-ratio.',
            pain: 'Video oder Bild — welche Maße bei festem Verhältnis?',
            solution: 'Breite/Höhe oder Zielverhältnis eingeben.',
            trust: TRUST_LOCAL,
            tags: ['Farbe', 'CSS', 'Rechnen'],
            keywords: ['aspect ratio calculator', 'seitenverhältnis berechnen', '16:9'],
            fileHints: [], command: '/aspect', entry: 'form', theme: KREATIV_THEME,
            maturity: 'stable', areas: ['kreativ'], storyIds: [],
        },
        fields: [
            { id: 'mode', type: 'segment', label: 'Modus', default: 'size-to-ratio',
              options: [
                { value: 'size-to-ratio', label: 'Pixel → Verhältnis' },
                { value: 'ratio-to-size', label: 'Verhältnis → Pixel' },
              ] },
            { id: 'width', type: 'number', label: 'Breite (px)', placeholder: '1920' },
            { id: 'height', type: 'number', label: 'Höhe (px)', placeholder: '1080' },
            { id: 'ratioW', type: 'number', label: 'Verhältnis Breite', default: '16' },
            { id: 'ratioH', type: 'number', label: 'Verhältnis Höhe', default: '9' },
        ],
        compute: computeAspectRatio,
    }, 'aspect-ratio',
);
