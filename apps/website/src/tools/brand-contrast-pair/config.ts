import { defineCheckTool } from '../_shared/shells';
import { KREATIV_THEME, TRUST_LOCAL } from '../_shared/color';
import { checkBrandContrast } from './compute';

export default defineCheckTool(
    {
        catalog: {
            id: 'brand-contrast-pair', slug: 'brand-contrast-pair', shortTitle: 'Marken-Kontrast',
            title: 'Markenfarbe + Text-Kontrast',
            sub: 'Weißer oder dunkler Text auf Logo-Farbe — WCAG-Check.',
            pain: 'Markenfarbe als Button-Hintergrund — ist der Text lesbar?',
            solution: 'Marken- und Textfarbe — Kontrast live.',
            trust: TRUST_LOCAL,
            tags: ['Farbe', 'Kontrast', 'WCAG', 'Prüfen'],
            keywords: ['logo farbe kontrast', 'brand color accessibility', 'markenfarbe text'],
            fileHints: [], command: '/brand-kontrast', entry: 'form', theme: KREATIV_THEME,
            maturity: 'stable', areas: ['kreativ', 'barrierefreiheit'], storyIds: [],
        },
        fields: [
            { id: 'brand', type: 'text', label: 'Markenfarbe', placeholder: '#9b5de5' },
            { id: 'text', type: 'text', label: 'Textfarbe', default: '#ffffff', placeholder: '#ffffff' },
        ],
        check: checkBrandContrast,
        autoCheck: true,
        trustNote: TRUST_LOCAL,
    }, 'brand-contrast-pair',
);
