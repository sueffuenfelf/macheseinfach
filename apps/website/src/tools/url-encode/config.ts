import { defineGenerateTool } from '../_shared/shells';
import { TRUST_LOCAL, WEB_THEME } from '../_shared/web/theme';
import { generateUrlEncode } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'url-encode',
            slug: 'url-encode',
            shortTitle: 'URL encode/decode',
            title: 'URL encode / decode',
            sub: 'Percent-Encoding für Query-Parameter — lokal im Browser.',
            pain: 'Query-Parameter kaputt oder doppelt encoded.',
            solution: 'Text einfügen — encode oder decode sofort.',
            trust: TRUST_LOCAL,
            tags: ['Encode', 'Dev'],
            keywords: ['url encode', 'url decoder', 'percent encoding', 'urlencoding'],
            fileHints: [],
            command: '/urlencode',
            entry: 'form',
            entryPlaceholder: 'Text oder %20 …',
            theme: WEB_THEME,
            maturity: 'stable',
            areas: ['web'],
            storyIds: ['story-url-encode'],
        },
        fields: [
            {
                id: 'mode',
                type: 'segment',
                label: 'Richtung',
                default: 'encode',
                options: [
                    { value: 'encode', label: 'Encode' },
                    { value: 'decode', label: 'Decode' },
                ],
            },
            {
                id: 'text',
                type: 'textarea',
                label: 'Eingabe',
                placeholder: 'Hallo Welt / a=1&b=2',
                rows: 5,
            },
        ],
        generate: generateUrlEncode,
        isReady: (v) => (v.text ?? '').length > 0,
        outputTitle: 'Ergebnis',
    },
    'url-encode',
);
