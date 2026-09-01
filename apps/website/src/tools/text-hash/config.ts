import { defineGenerateTool } from '../_shared/shells';
import { TRUST_LOCAL, WEB_THEME } from '../_shared/web/theme';
import { generateTextHash } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'text-hash',
            slug: 'text-hash',
            shortTitle: 'Text-Hash',
            title: 'Text hashen (SHA-256)',
            sub: 'SHA-256 (oder SHA-1) eines Strings — lokal im Browser.',
            pain: 'Checksumme eines Textes brauchen, ohne Datei-Upload.',
            solution: 'Text einfügen — Hash erscheint sofort.',
            trust: TRUST_LOCAL,
            tags: ['Hash', 'Dev'],
            keywords: ['sha256 online', 'hash berechnen', 'sha-256 text', 'text hash'],
            fileHints: [],
            command: '/hash',
            entry: 'form',
            entryPlaceholder: 'Text …',
            theme: WEB_THEME,
            maturity: 'stable',
            areas: ['web'],
        },
        fields: [
            {
                id: 'algo',
                type: 'segment',
                label: 'Algorithmus',
                default: 'SHA-256',
                options: [
                    { value: 'SHA-256', label: 'SHA-256' },
                    { value: 'SHA-1', label: 'SHA-1' },
                ],
            },
            {
                id: 'text',
                type: 'textarea',
                label: 'Text',
                placeholder: 'Text zum Hashen …',
                rows: 6,
            },
        ],
        generate: generateTextHash,
        isReady: (v) => (v.text ?? '').length > 0,
        outputTitle: 'Hash',
    },
    'text-hash',
);
