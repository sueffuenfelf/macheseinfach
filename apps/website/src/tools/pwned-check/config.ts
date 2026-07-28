import { defineCheckTool } from '../_shared/shells';
import { SECURITY_THEME, TRUST_HIBP } from '../_shared/security/theme';
import { checkPwned } from './compute';

export default defineCheckTool(
    {
        catalog: {
            id: 'pwned-check',
            slug: 'pwned-check',
            shortTitle: 'Leak-Check',
            title: 'Leak-Check',
            sub: 'Prüf, ob deine Daten in bekannten Leaks auftauchen — ohne Passwort preiszugeben.',
            pain: 'Unsicher nach Datenlecks — ohne Passwort preiszugeben.',
            solution: 'Passwort: k-Anonymity via HIBP. E-Mail: Hinweis zur offiziellen HIBP-Prüfung.',
            trust: TRUST_HIBP,
            tags: ['Passwort', 'E-Mail', 'HIBP'],
            keywords: ['pwned', 'passwort', 'leak', 'hibp', 'email', 'datenleck'],
            fileHints: [],
            command: '/pwned',
            entry: 'form',
            entryPlaceholder: 'E-Mail oder Passwort prüfen',
            theme: SECURITY_THEME,
            maturity: 'stable',
            areas: ['security'],
            storyIds: ['story-leak-email-passwort'],
        },
        fields: [
            {
                id: 'mode',
                type: 'segment',
                label: 'Was prüfen?',
                default: 'password',
                options: [
                    { value: 'password', label: 'Passwort' },
                    { value: 'email', label: 'E-Mail' },
                ],
            },
            {
                id: 'input',
                type: 'text',
                label: 'Eingabe',
                placeholder: 'Passwort oder E-Mail',
            },
        ],
        check: checkPwned,
        submitLabel: 'Prüfen',
        trustNote: TRUST_HIBP,
    },
    'pwned-check',
);
