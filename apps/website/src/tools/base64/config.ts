import { defineGenerateTool } from '../_shared/shells';
import { TRUST_LOCAL, WEB_THEME } from '../_shared/web/theme';
import { generateBase64 } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'base64',
            slug: 'base64',
            shortTitle: 'Base64',
            title: 'Base64 encode / decode',
            sub: 'Text zu Base64 und zurück — lokal im Browser.',
            pain: 'Token oder Snippet muss Base64 sein (oder lesbar werden).',
            solution: 'Text einfügen, Richtung wählen — Ergebnis zum Kopieren.',
            trust: TRUST_LOCAL,
            tags: ['Base64', 'Encode', 'Dev'],
            keywords: ['base64 encode', 'base64 decoder', 'base64 umwandeln'],
            fileHints: [],
            command: '/base64',
            entry: 'form',
            entryPlaceholder: 'Text oder Base64 …',
            theme: WEB_THEME,
            maturity: 'stable',
            areas: ['web'],
            storyIds: ['story-base64'],
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
                placeholder: 'Text oder Base64 …',
                rows: 6,
            },
        ],
        generate: generateBase64,
        isReady: (v) => (v.text ?? '').length > 0,
        outputTitle: 'Ergebnis',
        emptyHint: 'Text einfügen — Encode oder Decode erscheint hier.',
    },
    'base64',
);
