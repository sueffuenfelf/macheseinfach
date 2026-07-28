import { defineGenerateTool } from '../_shared/shells';
import { KOMMUNIKATION_THEME, TRUST_LOCAL } from '../_shared/kommunikation/theme';
import { generateEmailSignature } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'email-signature',
            slug: 'email-signature',
            shortTitle: 'E-Mail-Signatur',
            title: 'HTML-E-Mail-Signatur erzeugen',
            sub: 'Signatur für Outlook, Gmail und Co. — zum Kopieren.',
            pain: 'Professionelle Signatur — ohne Design-Tool.',
            solution: 'Kontaktdaten eingeben — HTML-Signatur erzeugen.',
            trust: TRUST_LOCAL,
            tags: ['Kommunikation', 'E-Mail', 'HTML'],
            keywords: ['email signatur generator', 'html signatur', 'e-mail fußzeile'],
            fileHints: [],
            command: '/signatur',
            entry: 'form',
            entryPlaceholder: 'Name, Firma, Telefon …',
            theme: KOMMUNIKATION_THEME,
            maturity: 'stable',
            areas: ['kommunikation'],
            storyIds: [],
        },
        fields: [
            { id: 'name', type: 'text', label: 'Name', placeholder: 'Max Mustermann' },
            { id: 'title', type: 'text', label: 'Position', placeholder: 'Projektleitung' },
            { id: 'company', type: 'text', label: 'Firma', placeholder: 'Beispiel GmbH' },
            { id: 'phone', type: 'text', label: 'Telefon', placeholder: '+49 30 123456' },
            { id: 'email', type: 'text', label: 'E-Mail', placeholder: 'max@beispiel.de' },
            { id: 'website', type: 'text', label: 'Website', placeholder: 'beispiel.de' },
        ],
        generate: generateEmailSignature,
        isReady: (v) => Boolean(v.name?.trim()),
        outputTitle: 'HTML-Signatur',
    },
    'email-signature',
);
