import { defineCalcTool } from '../_shared/shells';
import { KREATIV_THEME, TRUST_LOCAL } from '../_shared/color';
import { computeCmykRgb } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'cmyk-rgb', slug: 'cmyk-rgb', shortTitle: 'CMYK ↔ RGB',
            title: 'CMYK und RGB umrechnen',
            sub: 'Druckfarbe grob in Bildschirm-RGB — Orientierung, kein ICC-Profil.',
            pain: 'Druck-PDF nutzt CMYK — wie sieht das am Monitor aus?',
            solution: 'CMYK oder RGB eingeben — Gegenwert live.',
            trust: TRUST_LOCAL,
            tags: ['Farbe', 'Umwandeln'],
            keywords: ['cmyk zu rgb', 'cmyk umrechner', 'druckfarbe rgb'],
            fileHints: [], command: '/cmyk', entry: 'form', theme: KREATIV_THEME,
            maturity: 'stable', areas: ['kreativ'], storyIds: [],
        },
        fields: [
            { id: 'mode', type: 'segment', label: 'Richtung', default: 'cmyk-to-rgb',
              options: [{ value: 'cmyk-to-rgb', label: 'CMYK → RGB' }, { value: 'rgb-to-cmyk', label: 'RGB → CMYK' }] },
            { id: 'c', type: 'number', label: 'C %', placeholder: '0' },
            { id: 'm', type: 'number', label: 'M %', placeholder: '0' },
            { id: 'y', type: 'number', label: 'Y %', placeholder: '0' },
            { id: 'k', type: 'number', label: 'K %', placeholder: '100' },
            { id: 'hex', type: 'text', label: 'RGB/Hex', placeholder: '#000000' },
        ],
        compute: computeCmykRgb,
    }, 'cmyk-rgb',
);
