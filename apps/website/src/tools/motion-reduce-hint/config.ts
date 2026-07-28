import { defineGenerateTool } from '../_shared/shells';
import { A11Y_THEME, TRUST_LOCAL } from '../_shared/color';
import { generateMotionReduceHint } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'motion-reduce-hint',
            slug: 'motion-reduce-hint',
            shortTitle: 'Motion-Checkliste',
            title: 'Animation & prefers-reduced-motion',
            sub: 'Checkliste für barrierearme Animationen.',
            pain: 'Bewegung kann Übelkeit oder Ablenkung auslösen.',
            solution: 'Checkliste + CSS-Snippet für reduced-motion.',
            trust: TRUST_LOCAL,
            tags: ['A11y', 'CSS', 'Checkliste'],
            keywords: ['prefers reduced motion', 'animation barrierefreiheit', 'vestibular'],
            fileHints: [],
            command: '/motion',
            entry: 'form',
            theme: A11Y_THEME,
            maturity: 'stable',
            areas: ['barrierefreiheit'],
            storyIds: [],
        },
        fields: [],
        generate: generateMotionReduceHint,
        isReady: () => true,
        outputTitle: 'Checkliste',
    },
    'motion-reduce-hint',
);
