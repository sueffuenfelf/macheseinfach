import { defineCalcTool } from '../_shared/shells';
import { EINHEITEN_THEME, EINHEITEN_TRUST } from '../_shared/units';
import { computeDpiPixel } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'dpi-pixel',
            slug: 'dpi-pixel',
            shortTitle: 'DPI ↔ Pixel',
            title: 'DPI und Pixel berechnen',
            sub: 'Druckauflösung, Pixel und Zentimeter — für Flyer und Passfotos.',
            pain: 'Druckerei will 300 DPI — wie viele Pixel brauche ich?',
            solution: 'Modus wählen, Maße eingeben — Ergebnis live.',
            trust: EINHEITEN_TRUST,
            tags: ['Umwandeln'],
            keywords: ['dpi berechnen', 'pixel zu cm', 'druckauflösung', 'dpi pixel'],
            fileHints: [],
            command: '/dpi',
            entry: 'form',
            entryPlaceholder: 'Pixel oder cm …',
            theme: EINHEITEN_THEME,
            maturity: 'stable',
            areas: ['einheiten'],
            storyIds: [],
        },
        fields: [
            {
                id: 'mode',
                type: 'segment',
                label: 'Modus',
                default: 'px-to-cm',
                options: [
                    { value: 'px-to-cm', label: 'px → cm' },
                    { value: 'cm-to-px', label: 'cm → px' },
                    { value: 'dpi-calc', label: 'DPI' },
                ],
            },
            {
                id: 'a',
                type: 'number',
                label: 'Wert A',
                placeholder: 'z. B. 2480',
                hint: 'px → cm: Pixel · cm → px: cm · DPI: Pixel',
            },
            {
                id: 'b',
                type: 'number',
                label: 'Wert B',
                placeholder: 'z. B. 300',
                hint: 'px/cm-Modus: DPI · DPI-Modus: Breite in cm',
            },
        ],
        compute: computeDpiPixel,
        intro: 'px → cm: Pixel + DPI · cm → px: cm + DPI · DPI: Pixel + Breite in cm.',
    },
    'dpi-pixel',
);
