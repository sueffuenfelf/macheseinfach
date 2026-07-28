import { defineGenerateTool } from '../_shared/shells';
import { SECURITY_THEME, TRUST_LOCAL } from '../_shared/security/theme';
import { generateTotp } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'totp-generator',
            slug: 'totp-generator',
            shortTitle: '2FA-Code',
            title: 'TOTP-Code erzeugen',
            sub: 'Zwei-Faktor-Code aus deinem Secret — lokal berechnet, kein Upload.',
            pain: 'Authenticator-App nicht griffbereit — brauche den aktuellen Code.',
            solution: 'Base32-Secret einfügen, Code erscheint sofort.',
            trust: TRUST_LOCAL,
            tags: ['2FA', 'Passwort', 'Security'],
            keywords: ['totp', '2fa', 'authenticator', 'otp', 'zwei-faktor', 'code'],
            fileHints: [],
            command: '/totp',
            entry: 'form',
            entryPlaceholder: 'Base32-Secret',
            theme: SECURITY_THEME,
            maturity: 'stable',
            areas: ['security'],
            storyIds: [],
        },
        fields: [
            {
                id: 'secret',
                type: 'text',
                label: 'Secret (Base32)',
                placeholder: 'JBSWY3DPEHPK3PXP',
                mono: true,
                hint: 'Nur lokal — Secret verlässt deinen Browser nicht.',
            },
            {
                id: 'period',
                type: 'segment',
                label: 'Intervall',
                default: '30',
                options: [
                    { value: '30', label: '30 s' },
                    { value: '60', label: '60 s' },
                ],
            },
            {
                id: 'digits',
                type: 'segment',
                label: 'Ziffern',
                default: '6',
                options: [
                    { value: '6', label: '6' },
                    { value: '8', label: '8' },
                ],
            },
        ],
        generate: generateTotp,
        isReady: (values) => (values.secret ?? '').trim().length > 0,
        outputTitle: 'Aktueller Code',
        emptyHint: 'Secret eingeben — der Code aktualisiert sich automatisch.',
    },
    'totp-generator',
);
