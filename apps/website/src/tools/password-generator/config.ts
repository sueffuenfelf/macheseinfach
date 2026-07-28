import { defineGenerateTool } from '../_shared/shells';
import { SECURITY_THEME, TRUST_LOCAL } from '../_shared/security/theme';
import { generateSecurePassword } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'password-generator',
            slug: 'password-generator',
            shortTitle: 'Passwort erzeugen',
            title: 'Sicheres Passwort erzeugen',
            sub: 'Zufallspasswörter mit crypto.getRandomValues — lokal, ohne Server.',
            pain: 'Brauche ein starkes Passwort, das ich nirgends wiederverwende.',
            solution: 'Länge und Zeichensatz wählen — sofort kopieren.',
            trust: TRUST_LOCAL,
            tags: ['Passwort', 'Security'],
            keywords: ['passwort', 'generator', 'zufall', 'sicher', 'erzeugen'],
            fileHints: [],
            command: '/passwort-generator',
            entry: 'form',
            entryPlaceholder: 'Länge wählen',
            theme: SECURITY_THEME,
            maturity: 'stable',
            areas: ['security'],
            storyIds: [],
        },
        fields: [
            {
                id: 'length',
                type: 'number',
                label: 'Länge',
                default: '20',
                placeholder: '20',
                suffix: 'Zeichen',
            },
            {
                id: 'preset',
                type: 'segment',
                label: 'Zeichensatz',
                default: 'strong',
                options: [
                    { value: 'strong', label: 'Alle Zeichen' },
                    { value: 'letters-numbers', label: 'Buchstaben + Zahlen' },
                    { value: 'letters-only', label: 'Nur Buchstaben' },
                    { value: 'pin', label: 'Nur Ziffern (PIN)' },
                ],
            },
        ],
        generate: generateSecurePassword,
        isReady: (values) => (values.length ?? '').trim().length > 0,
        outputTitle: 'Passwort',
        emptyHint: 'Länge festlegen — das Passwort erscheint automatisch.',
    },
    'password-generator',
);
