import { defineGenerateTool } from '../_shared/shells';
import { TRUST_LOCAL, WEB_THEME } from '../_shared/web/theme';
import { generateHtmlEscape } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'html-escape',
            slug: 'html-escape',
            shortTitle: 'HTML escapen',
            title: 'HTML escapen / unescapen',
            sub: 'Sonderzeichen für sichere Snippets — lokal im Browser.',
            pain: 'HTML-Snippet mit < und & — kaputt oder unsicher.',
            solution: 'Text einfügen — escapen oder zurückwandeln.',
            trust: TRUST_LOCAL,
            tags: ['HTML', 'Encode', 'Dev'],
            keywords: ['html escape', 'html entities', 'specialchars', 'html encode'],
            fileHints: [],
            command: '/htmlescape',
            entry: 'form',
            entryPlaceholder: '<div>…</div>',
            theme: WEB_THEME,
            maturity: 'stable',
            areas: ['web'],
            storyIds: ['story-html-escape'],
        },
        fields: [
            {
                id: 'mode',
                type: 'segment',
                label: 'Richtung',
                default: 'escape',
                options: [
                    { value: 'escape', label: 'Escape' },
                    { value: 'unescape', label: 'Unescape' },
                ],
            },
            {
                id: 'text',
                type: 'textarea',
                label: 'Eingabe',
                placeholder: '<script>alert("x")</script>',
                rows: 6,
            },
        ],
        generate: generateHtmlEscape,
        isReady: (v) => (v.text ?? '').length > 0,
        outputTitle: 'Ergebnis',
    },
    'html-escape',
);
