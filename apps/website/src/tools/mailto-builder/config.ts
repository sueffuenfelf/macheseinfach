import { defineGenerateTool } from '../_shared/shells';
import { KOMMUNIKATION_THEME, TRUST_LOCAL } from '../_shared/kommunikation/theme';
import { generateMailtoLink } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'mailto-builder',
            slug: 'mailto-builder',
            shortTitle: 'Mailto-Link',
            title: 'Mailto-Link erzeugen',
            sub: 'Betreff und Text für Kontakt-Buttons — mailto: URI.',
            pain: 'Kontakt-Button mit Betreff — mailto korrekt encoden.',
            solution: 'E-Mail, Betreff und Text eingeben — Link kopieren.',
            trust: TRUST_LOCAL,
            tags: ['Kommunikation', 'E-Mail', 'Encode'],
            keywords: ['mailto link generator', 'mailto mit betreff', 'kontakt button email'],
            fileHints: [],
            command: '/mailto',
            entry: 'form',
            entryPlaceholder: 'E-Mail-Adresse …',
            theme: KOMMUNIKATION_THEME,
            maturity: 'stable',
            areas: ['kommunikation'],
            storyIds: [],
        },
        fields: [
            { id: 'email', type: 'text', label: 'E-Mail', placeholder: 'kontakt@beispiel.de' },
            { id: 'subject', type: 'text', label: 'Betreff', placeholder: 'Anfrage über Website' },
            {
                id: 'body',
                type: 'textarea',
                label: 'Nachricht',
                placeholder: 'Guten Tag, …',
                rows: 4,
            },
        ],
        generate: generateMailtoLink,
        isReady: (v) => Boolean(v.email?.trim()),
        outputTitle: 'Mailto-Link',
    },
    'mailto-builder',
);
