import { defineCalcTool } from '../_shared/shells';
import { computeSmsCount } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'sms-counter',
            slug: 'sms-counter',
            shortTitle: 'SMS-Länge',
            title: 'SMS-Zeichenzähler',
            sub: 'GSM-7 vs. UCS-2 — Segmente und Freiraum live sehen.',
            pain: 'Benachrichtigung oder 2FA-Text — wie viele SMS-Segmente?',
            solution: 'Text einfügen — Kodierung und Segmentzahl erscheinen sofort.',
            trust: 'Lokal gezählt · nichts wird hochgeladen',
            tags: ['Text', 'SMS', 'Zähler'],
            keywords: ['sms zeichen', 'sms zähler 160', 'gsm 7bit', 'ucs-2', 'sms segmente'],
            fileHints: [],
            command: '/sms',
            entry: 'form',
            entryPlaceholder: 'SMS-Text …',
            theme: { accent: '#7dd3c0', accentStrong: '#000', accentSoft: '#e8f7f3' },
            maturity: 'stable',
            areas: ['text'],
        },
        fields: [
            {
                id: 'text',
                type: 'textarea',
                label: 'SMS-Text',
                placeholder: 'Nachricht hier …',
                rows: 6,
            },
        ],
        compute: computeSmsCount,
        intro: 'Sonderzeichen (z. B. Emoji) schalten auf UCS-2 um — kürzere Segmente.',
    },
    'sms-counter',
);
