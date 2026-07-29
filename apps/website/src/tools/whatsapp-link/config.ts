import { defineGenerateTool } from '../_shared/shells';
import { KOMMUNIKATION_THEME, TRUST_LOCAL } from '../_shared/kommunikation/theme';
import { generateWhatsappLink } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'whatsapp-link',
            slug: 'whatsapp-link',
            shortTitle: 'WhatsApp-Link',
            title: 'WhatsApp-Link generieren',
            sub: 'wa.me mit vorausgefülltem Text — für Website oder QR.',
            pain: 'Kunden sollen per WhatsApp schreiben — Link mit Text vorbereiten.',
            solution: 'Nummer und Nachricht eingeben — wa.me-Link kopieren.',
            trust: TRUST_LOCAL,
            tags: ['Kommunikation', 'WhatsApp', 'Encode'],
            keywords: ['whatsapp link generieren', 'wa.me link', 'whatsapp api link'],
            fileHints: [],
            command: '/whatsapp',
            entry: 'form',
            entryPlaceholder: 'Telefonnummer …',
            theme: KOMMUNIKATION_THEME,
            maturity: 'stable',
            areas: ['kommunikation'],
            storyIds: ['story-whatsapp-link'],
        },
        fields: [
            { id: 'phone', type: 'text', label: 'Telefonnummer', placeholder: '0151 12345678' },
            {
                id: 'message',
                type: 'textarea',
                label: 'Vorausgefüllter Text',
                placeholder: 'Hallo, ich interessiere mich für …',
                rows: 3,
            },
        ],
        generate: generateWhatsappLink,
        isReady: (v) => Boolean(v.phone?.trim()),
        outputTitle: 'WhatsApp-Link',
    },
    'whatsapp-link',
);
