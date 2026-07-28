import { defineTool } from '../types';

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
    },
    'pwned-check',
);
