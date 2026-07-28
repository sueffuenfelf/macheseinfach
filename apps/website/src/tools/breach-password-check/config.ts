import { defineCheckTool } from '../_shared/shells';
import { SECURITY_THEME, TRUST_HIBP } from '../_shared/security/theme';
import { checkBreachPassword } from './compute';

export default defineCheckTool(
    {
        catalog: {
            id: 'breach-password-check',
            slug: 'breach-password-check',
            shortTitle: 'Passwort-Leak',
            title: 'Passwort-Leak prüfen',
            sub: 'Have I Been Pwned mit k-Anonymität — nur ein Hash-Prefix verlässt den Browser.',
            pain: 'War mein Passwort schon mal in einem Datenleck?',
            solution: 'Passwort eingeben — HIBP vergleicht nur den Hash-Prefix.',
            trust: TRUST_HIBP,
            tags: ['Passwort', 'HIBP', 'Security', 'Prüfen'],
            keywords: ['passwort', 'leak', 'hibp', 'pwned', 'datenleck', 'breach'],
            fileHints: [],
            command: '/passwort-leak',
            entry: 'form',
            entryPlaceholder: 'Passwort prüfen',
            theme: SECURITY_THEME,
            maturity: 'stable',
            areas: ['security'],
            storyIds: [],
        },
        fields: [
            {
                id: 'password',
                type: 'text',
                label: 'Passwort',
                placeholder: 'Passwort zur Leak-Prüfung',
                hint: 'Wird gehasht — nur die ersten 5 Zeichen des SHA-1-Hashs gehen an HIBP.',
            },
        ],
        check: checkBreachPassword,
        submitLabel: 'Gegen Leaks prüfen',
        trustNote: TRUST_HIBP,
    },
    'breach-password-check',
);
