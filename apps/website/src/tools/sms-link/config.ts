import { defineGenerateTool } from '../_shared/shells';
import { KOMMUNIKATION_THEME, TRUST_LOCAL } from '../_shared/kommunikation/theme';
import { generateSmsLink } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'sms-link',
            slug: 'sms-link',
            shortTitle: 'SMS-Link',
            title: 'SMS-Link generieren',
            sub: 'sms:-URI mit Text — für mobile Kontakt-Buttons.',
            pain: 'SMS mit vorausgefülltem Text — Link für Website.',
            solution: 'Nummer und Text eingeben — sms:-Link kopieren.',
            trust: TRUST_LOCAL,
            tags: ['Kommunikation', 'SMS', 'Encode'],
            keywords: ['sms link generieren', 'sms uri', 'sms vorlage link'],
            fileHints: [],
            command: '/sms-link',
            entry: 'form',
            entryPlaceholder: 'Telefonnummer …',
            theme: KOMMUNIKATION_THEME,
            maturity: 'stable',
            areas: ['kommunikation'],
            storyIds: [],
        },
        fields: [
            { id: 'phone', type: 'text', label: 'Telefonnummer', placeholder: '0151 12345678' },
            {
                id: 'message',
                type: 'textarea',
                label: 'Nachricht',
                placeholder: 'Hallo, ich rufe wegen …',
                rows: 3,
            },
        ],
        generate: generateSmsLink,
        isReady: (v) => Boolean(v.phone?.trim()),
        outputTitle: 'SMS-Link',
    },
    'sms-link',
);
