import { defineGenerateTool } from '../_shared/shells';
import { TRUST_LOCAL, WEB_THEME } from '../_shared/web/theme';
import { generateRegexTest } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'regex-tester',
            slug: 'regex-tester',
            shortTitle: 'Regex testen',
            title: 'Regex-Tester',
            sub: 'Pattern gegen Beispieltext prüfen — lokal im Browser.',
            pain: 'Regex schreiben und unsicher, ob es matcht.',
            solution: 'Pattern und Text einfügen — Treffer erscheinen sofort.',
            trust: TRUST_LOCAL,
            tags: ['Regex', 'Dev', 'Prüfen'],
            keywords: ['regex tester', 'regulärer ausdruck testen', 'regex online'],
            fileHints: [],
            command: '/regex',
            entry: 'form',
            entryPlaceholder: 'Pattern …',
            theme: WEB_THEME,
            maturity: 'stable',
            areas: ['web'],
            storyIds: [],
        },
        fields: [
            {
                id: 'pattern',
                type: 'text',
                label: 'Pattern',
                placeholder: '\\d+',
                mono: true,
            },
            {
                id: 'flags',
                type: 'text',
                label: 'Flags',
                default: 'g',
                placeholder: 'gimu',
                mono: true,
            },
            {
                id: 'text',
                type: 'textarea',
                label: 'Testtext',
                placeholder: 'Beispieltext mit Zahlen 42 und 7',
                rows: 6,
            },
        ],
        generate: generateRegexTest,
        isReady: (v) => (v.pattern ?? '').length > 0,
        outputTitle: 'Treffer',
        emptyHint: 'Pattern eingeben — Treffer erscheinen hier.',
    },
    'regex-tester',
);
