import { defineGenerateTool } from '../_shared/shells';
import { KOMMUNIKATION_THEME, TRUST_LOCAL } from '../_shared/kommunikation/theme';
import { generateVCardQr } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'vcard-qr',
            slug: 'vcard-qr',
            shortTitle: 'vCard-QR',
            title: 'vCard-QR-Code erzeugen',
            sub: 'Visitenkarte als QR — Kontakt direkt scannen lassen.',
            pain: 'Kontaktdaten schnell teilen — ohne Tippfehler.',
            solution: 'Name und Kontaktdaten eingeben — QR-Code erzeugen und herunterladen.',
            trust: TRUST_LOCAL,
            tags: ['Kommunikation', 'QR', 'vCard'],
            keywords: ['vcard qr code', 'visitenkarte qr', 'kontakt qr code'],
            fileHints: [],
            command: '/vcard-qr',
            entry: 'form',
            entryPlaceholder: 'Name, Telefon, E-Mail …',
            theme: KOMMUNIKATION_THEME,
            maturity: 'stable',
            areas: ['kommunikation'],
            storyIds: ['story-vcard-qr'],
        },
        fields: [
            { id: 'firstName', type: 'text', label: 'Vorname', placeholder: 'Max' },
            { id: 'lastName', type: 'text', label: 'Nachname', placeholder: 'Mustermann' },
            { id: 'org', type: 'text', label: 'Firma', placeholder: 'Beispiel GmbH' },
            { id: 'title', type: 'text', label: 'Position', placeholder: 'Geschäftsführung' },
            { id: 'phone', type: 'text', label: 'Telefon', placeholder: '+49 30 123456' },
            { id: 'email', type: 'text', label: 'E-Mail', placeholder: 'max@beispiel.de' },
            { id: 'url', type: 'text', label: 'Website', placeholder: 'https://beispiel.de' },
        ],
        generate: generateVCardQr,
        isReady: (v) => Boolean(v.firstName?.trim() || v.lastName?.trim()),
        outputTitle: 'QR-Code',
    },
    'vcard-qr',
);
