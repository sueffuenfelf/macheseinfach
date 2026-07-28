import { defineExtractTool } from '../_shared/shells';
import { SECURITY_THEME, TRUST_LOCAL } from '../_shared/security/theme';
import { extractFileHash } from './compute';

export default defineExtractTool(
    {
        catalog: {
            id: 'hash-file',
            slug: 'hash-file',
            shortTitle: 'Datei-Hash',
            title: 'Datei-Hash berechnen',
            sub: 'SHA-256-Prüfsumme einer Datei — komplett lokal im Browser.',
            pain: 'Brauche einen Hash, um Datei-Integrität zu prüfen.',
            solution: 'Datei hochladen, SHA-256 sofort berechnen und kopieren.',
            trust: TRUST_LOCAL,
            tags: ['Security', 'Prüfen', 'Upload'],
            keywords: ['hash', 'sha256', 'checksum', 'prüfsumme', 'datei', 'integrität'],
            fileHints: ['any'],
            command: '/hash',
            entry: 'file',
            entryPlaceholder: 'Datei für SHA-256',
            theme: SECURITY_THEME,
            maturity: 'stable',
            areas: ['security'],
            storyIds: [],
        },
        extract: extractFileHash,
        mode: 'file',
        submitLabel: 'Hash berechnen',
        emptyHint: 'Keine Datei erkannt — bitte erneut versuchen.',
    },
    'hash-file',
);
