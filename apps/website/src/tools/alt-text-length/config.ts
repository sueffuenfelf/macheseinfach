import { defineCalcTool } from '../_shared/shells';
import { A11Y_THEME, TRUST_LOCAL } from '../_shared/color';
import { computeAltTextLength } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'alt-text-length',
            slug: 'alt-text-length',
            shortTitle: 'Alt-Text Länge',
            title: 'Alt-Text Länge prüfen',
            sub: 'Wie lang ist die Bildbeschreibung — zu kurz oder zu lang?',
            pain: 'Alt-Texte sollen informativ sein, aber Screenreader nicht überfordern.',
            solution: 'Text einfügen — Zeichen, Wörter und Hinweis erscheinen live.',
            trust: TRUST_LOCAL,
            tags: ['A11y', 'Text', 'Prüfen'],
            keywords: ['alt text länge', 'alt attribut best practice', 'bildbeschreibung'],
            fileHints: [],
            command: '/alt-text',
            entry: 'form',
            theme: A11Y_THEME,
            maturity: 'stable',
            areas: ['barrierefreiheit'],
            storyIds: [],
        },
        fields: [
            { id: 'text', type: 'textarea', label: 'Alt-Text', placeholder: 'Beschreibung des Bildes …', rows: 4 },
        ],
        compute: computeAltTextLength,
    },
    'alt-text-length',
);
