import { defineCheckTool } from '../_shared/shells';
import { A11Y_THEME, TRUST_LOCAL } from '../_shared/color';
import { checkContrast } from './compute';

export default defineCheckTool(
    {
        catalog: {
            id: 'contrast-check',
            slug: 'contrast-check',
            shortTitle: 'Kontrast',
            title: 'Farbkontrast prüfen (WCAG)',
            sub: 'Textfarbe auf Hintergrund — WCAG AA/AAA nach relativer Luminanz.',
            pain: 'Ist mein Text auf dem Hintergrund gut lesbar?',
            solution: 'Zwei Farben eingeben — Kontrastverhältnis und WCAG-Stufen sofort sehen.',
            trust: TRUST_LOCAL,
            tags: ['A11y', 'Kontrast', 'WCAG', 'Prüfen'],
            keywords: ['kontrast prüfer', 'wcag kontrast', 'farbkontrast berechnen', 'accessibility contrast'],
            fileHints: [],
            command: '/kontrast',
            entry: 'form',
            entryPlaceholder: '#000000 auf #ffffff',
            theme: A11Y_THEME,
            maturity: 'stable',
            areas: ['barrierefreiheit', 'kreativ'],
            storyIds: ['story-kontrast'],
        },
        fields: [
            { id: 'fg', type: 'text', label: 'Textfarbe', placeholder: '#000000', default: '#000000' },
            { id: 'bg', type: 'text', label: 'Hintergrund', placeholder: '#ffffff', default: '#ffffff' },
        ],
        check: checkContrast,
        autoCheck: true,
        trustNote: TRUST_LOCAL,
    },
    'contrast-check',
);
