import { defineGenerateTool } from '../_shared/shells';
import { A11Y_THEME, TRUST_LOCAL } from '../_shared/color';
import { generateAriaNameHint } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'aria-name-hint',
            slug: 'aria-name-hint',
            shortTitle: 'ARIA-Name',
            title: 'ARIA-Name Checkliste',
            sub: 'Haben Buttons und Controls einen zugänglichen Namen?',
            pain: 'Icon-only Buttons sind für Screenreader oft leer.',
            solution: 'Checkliste mit aria-label, label und alt-Regeln.',
            trust: TRUST_LOCAL,
            tags: ['A11y', 'Checkliste'],
            keywords: ['aria label', 'accessible name', 'button ohne text'],
            fileHints: [],
            command: '/aria',
            entry: 'form',
            theme: A11Y_THEME,
            maturity: 'stable',
            areas: ['barrierefreiheit'],
            storyIds: [],
        },
        fields: [],
        generate: generateAriaNameHint,
        isReady: () => true,
        outputTitle: 'Checkliste',
    },
    'aria-name-hint',
);
