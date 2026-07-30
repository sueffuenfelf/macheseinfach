import { defineGenerateTool } from '../_shared/shells';
import { A11Y_THEME, TRUST_LOCAL } from '../_shared/color';
import { generateFocusVisibleHint } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'focus-visible-hint',
            slug: 'focus-visible-hint',
            shortTitle: 'Focus-Checkliste',
            title: 'Tastatur-Fokus Checkliste',
            sub: 'Ist der Fokus sichtbar und per Tab erreichbar?',
            pain: 'Ohne sichtbaren Fokus ist die Seite per Tastatur kaum nutzbar.',
            solution: 'Checkliste generieren — zum Abhaken und Kopieren.',
            trust: TRUST_LOCAL,
            tags: ['A11y', 'CSS', 'Checkliste'],
            keywords: ['focus outline', 'tastatur bedienbarkeit checkliste', 'focus visible'],
            fileHints: [],
            command: '/focus',
            entry: 'form',
            theme: A11Y_THEME,
            maturity: 'stable',
            areas: ['barrierefreiheit'],
            storyIds: ['story-fokus-sichtbar'],
        },
        fields: [
            {
                id: 'scope', type: 'segment', label: 'Umfang', default: 'website',
                options: [
                    { value: 'website', label: 'Website' },
                    { value: 'component', label: 'Komponente' },
                ],
            },
        ],
        generate: generateFocusVisibleHint,
        isReady: () => true,
        outputTitle: 'Checkliste',
    },
    'focus-visible-hint',
);
