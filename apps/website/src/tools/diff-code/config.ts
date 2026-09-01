import { defineGenerateTool } from '../_shared/shells';
import { TRUST_LOCAL, WEB_THEME } from '../_shared/web/theme';
import { generateCodeDiff } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'diff-code',
            slug: 'diff-code',
            shortTitle: 'Code-Diff',
            title: 'Code-Diff',
            sub: 'Zwei Snippets vergleichen — Unified Diff lokal im Browser.',
            pain: 'Zwei Code-Versionen — was hat sich geändert?',
            solution: 'Beide Texte einfügen — Diff erscheint sofort.',
            trust: TRUST_LOCAL,
            tags: ['Diff', 'Dev'],
            keywords: ['code diff', 'text diff online', 'diff snippets', 'unified diff'],
            fileHints: [],
            command: '/codediff',
            entry: 'form',
            entryPlaceholder: 'Zwei Snippets …',
            theme: WEB_THEME,
            maturity: 'stable',
            areas: ['web'],
        },
        fields: [
            {
                id: 'a',
                type: 'textarea',
                label: 'Version A (alt)',
                placeholder: 'function a() { … }',
                rows: 8,
            },
            {
                id: 'b',
                type: 'textarea',
                label: 'Version B (neu)',
                placeholder: 'function a() { … }',
                rows: 8,
            },
        ],
        generate: generateCodeDiff,
        isReady: (v) => (v.a ?? '').length > 0 || (v.b ?? '').length > 0,
        outputTitle: 'Diff',
        emptyHint: 'Beide Snippets einfügen — der Diff erscheint hier.',
    },
    'diff-code',
);
