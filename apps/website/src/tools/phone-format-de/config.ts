import { defineGenerateTool } from '../_shared/shells';
import { KOMMUNIKATION_THEME, TRUST_LOCAL } from '../_shared/kommunikation/theme';
import { generatePhoneFormatDe } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'phone-format-de',
            slug: 'phone-format-de',
            shortTitle: 'Telefon formatieren',
            title: 'Deutsche Telefonnummer formatieren',
            sub: '+49 / 0… einheitlich — für Links und Signaturen.',
            pain: 'Nummern in verschiedenen Formaten — einheitlich darstellen.',
            solution: 'Nummer eingeben — nationale und internationale Formate anzeigen.',
            trust: TRUST_LOCAL,
            tags: ['Kommunikation', 'Umwandeln'],
            keywords: ['telefonnummer formatieren', 'rufnummer normalisieren', '+49 format'],
            fileHints: [],
            command: '/telefon-format',
            entry: 'form',
            entryPlaceholder: '0151 … oder +49 …',
            theme: KOMMUNIKATION_THEME,
            maturity: 'stable',
            areas: ['kommunikation'],
            storyIds: [],
        },
        fields: [
            {
                id: 'phone',
                type: 'text',
                label: 'Telefonnummer',
                placeholder: '0151 12345678 oder +49 151 12345678',
            },
        ],
        generate: generatePhoneFormatDe,
        isReady: (v) => Boolean(v.phone?.trim()),
        outputTitle: 'Formate',
    },
    'phone-format-de',
);
