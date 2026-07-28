import { defineCheckTool } from '../_shared/shells';
import { SECURITY_THEME, TRUST_LOCAL } from '../_shared/security/theme';
import { checkPasswordStrength } from './compute';

export default defineCheckTool(
    {
        catalog: {
            id: 'password-strength',
            slug: 'password-strength',
            shortTitle: 'Passwort-Stärke',
            title: 'Passwort-Stärke prüfen',
            sub: 'Entropie und typische Muster lokal bewerten — ohne Upload.',
            pain: 'Unsicher, ob das Passwort stark genug ist.',
            solution: 'Sofortige Bewertung im Browser — nichts verlässt dein Gerät.',
            trust: TRUST_LOCAL,
            tags: ['Passwort', 'Security', 'Prüfen'],
            keywords: ['passwort', 'stärke', 'strength', 'entropie', 'sicher', 'prüfen'],
            fileHints: [],
            command: '/passwort-staerke',
            entry: 'form',
            entryPlaceholder: 'Passwort eingeben',
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
                placeholder: 'Passwort zur Prüfung',
                hint: 'Wird nur lokal analysiert — nicht gespeichert oder übertragen.',
            },
        ],
        check: checkPasswordStrength,
        autoCheck: true,
        trustNote: TRUST_LOCAL,
    },
    'password-strength',
);
