import { defineExtractTool } from '../_shared/shells';
import { SECURITY_THEME, TRUST_LOCAL } from '../_shared/security/theme';
import { extractRedactedText } from './compute';

export default defineExtractTool(
    {
        catalog: {
            id: 'privacy-redact-text',
            slug: 'privacy-redact-text',
            shortTitle: 'Text schwärzen',
            title: 'Text privat schwärzen',
            sub: 'E-Mails, Telefonnummern, IBANs und Namen maskieren — lokal im Browser.',
            pain: 'Text teilen, aber personenbezogene Daten entfernen.',
            solution: 'Einfügen, Muster erkennen, geschwärzte Version kopieren.',
            trust: TRUST_LOCAL,
            tags: ['Datenschutz', 'Text', 'Security'],
            keywords: ['schwärzen', 'redact', 'anonymisieren', 'datenschutz', 'maskieren', 'email'],
            fileHints: [],
            command: '/schwaerzen',
            entry: 'form',
            entryPlaceholder: 'Text mit personenbezogenen Daten',
            theme: SECURITY_THEME,
            maturity: 'stable',
            areas: ['security'],
            storyIds: [],
        },
        extract: extractRedactedText,
        mode: 'text',
        placeholder: 'Hallo Max Mustermann, meine E-Mail ist max@beispiel.de …',
        submitLabel: 'Schwärzen',
        emptyHint: 'Kein Text erkannt.',
    },
    'privacy-redact-text',
);
