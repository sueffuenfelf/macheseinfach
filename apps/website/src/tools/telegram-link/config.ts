import { defineGenerateTool } from '../_shared/shells';
import { KOMMUNIKATION_THEME, TRUST_LOCAL } from '../_shared/kommunikation/theme';
import { generateTelegramLink } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'telegram-link',
            slug: 'telegram-link',
            shortTitle: 'Telegram-Link',
            title: 'Telegram-Link generieren',
            sub: 't.me-Link mit optionalem Text — für Website oder Bio.',
            pain: 'Telegram-Kontakt verlinken — Username korrekt als URL.',
            solution: 'Username und Text eingeben — Link kopieren.',
            trust: TRUST_LOCAL,
            tags: ['Kommunikation', 'Telegram', 'Encode'],
            keywords: ['telegram link generieren', 't.me link', 'telegram share url'],
            fileHints: [],
            command: '/telegram',
            entry: 'form',
            entryPlaceholder: '@username …',
            theme: KOMMUNIKATION_THEME,
            maturity: 'stable',
            areas: ['kommunikation'],
            storyIds: [],
        },
        fields: [
            { id: 'username', type: 'text', label: 'Username', placeholder: '@beispiel' },
            {
                id: 'message',
                type: 'textarea',
                label: 'Vorausgefüllter Text',
                placeholder: 'Hallo …',
                rows: 2,
            },
        ],
        generate: generateTelegramLink,
        isReady: (v) => Boolean(v.username?.trim()),
        outputTitle: 'Telegram-Link',
    },
    'telegram-link',
);
