import { defineTool } from '../types';
import { PasswordMiniWidget } from './widgets/PasswordMiniWidget';
import { QuickLeakWidget } from './widgets/QuickLeakWidget';

export default defineTool(
    {
        catalog: {
            id: 'pwned-check',
            slug: 'pwned-check',
            shortTitle: 'Leak-Check',
            title: 'Leak-Check',
            sub: 'Prüf, ob deine Daten in bekannten Leaks auftauchen — ohne Passwort preiszugeben.',
            pain: 'Unsicher nach Datenlecks — ohne Passwort preiszugeben.',
            solution: 'k-Anonymity via Have I Been Pwned — nur Hash-Prefix.',
            trust: 'k-Anonymität · Passwort bleibt geheim',
            tags: ['Passwort', 'E-Mail', 'HIBP'],
            keywords: ['pwned', 'passwort', 'leak', 'hibp', 'email', 'datenleck'],
            fileHints: [],
            command: '/pwned',
            entry: 'form',
            entryPlaceholder: 'E-Mail oder Passwort prüfen',
            theme: { accent: '#23c9a0', accentStrong: '#000', accentSoft: '#d8f5ec' },
            maturity: 'planned',
            areas: ['security'],
            storyIds: ['story-leak-email-passwort'],
        },
        widgets: [
            {
                id: 'widget-leak-check',
                title: 'Leak-Check',
                description: 'E-Mail auf bekannte Leaks pruefen.',
                tags: ['Security', 'E-Mail'],
                component: QuickLeakWidget,
                supportsLinkedInput: true,
                outputPorts: [
                    { id: 'value', label: 'E-Mail' },
                    { id: 'status', label: 'Status' },
                ],
                minW: 3,
                maxW: 6,
                minH: 3,
                maxH: 5,
                defaultW: 4,
                defaultH: 3,
            },
            {
                id: 'widget-password-mini',
                title: 'Passwort Generator',
                description: 'Lokaler Passwortgenerator mit Copy.',
                tags: ['Passwort', 'Generator'],
                component: PasswordMiniWidget,
                minW: 4,
                maxW: 8,
                minH: 2,
                maxH: 4,
                defaultW: 4,
                defaultH: 2,
            },
        ],
    },
    'pwned-check',
);
