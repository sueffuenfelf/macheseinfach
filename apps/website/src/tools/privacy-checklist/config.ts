import { defineGenerateTool } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL, RECHT_THEME, TRUST_LOCAL } from '../_shared/recht/theme';
import { generatePrivacyChecklist } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'privacy-checklist',
            slug: 'privacy-checklist',
            shortTitle: 'Datenschutz-Checkliste',
            title: 'Datenschutz-Checkliste für Websites',
            sub: 'DSGVO-Basics — Checkliste, kein Rechtstext-Generator.',
            pain: 'Welche Punkte gehören in eine Datenschutzerklärung grob?',
            solution: 'Scope wählen — Checkliste zum Abhaken erzeugen.',
            trust: TRUST_LOCAL,
            tags: ['Recht', 'Datenschutz', 'Checkliste', 'Web'],
            keywords: ['datenschutzerklärung checkliste', 'dsgvo website checkliste', 'datenschutz website'],
            fileHints: [],
            command: '/datenschutz-check',
            entry: 'form',
            entryPlaceholder: 'Website-Typ …',
            theme: RECHT_THEME,
            maturity: 'stable',
            areas: ['recht'],
            storyIds: [],
        },
        fields: [
            {
                id: 'scope',
                type: 'segment',
                label: 'Scope',
                default: 'website',
                options: [
                    { value: 'website', label: 'Website' },
                    { value: 'shop', label: 'Shop' },
                    { value: 'newsletter', label: 'Newsletter' },
                ],
            },
        ],
        generate: generatePrivacyChecklist,
        isReady: () => true,
        outputTitle: 'Checkliste',
        emptyHint: DISCLAIMER_NO_LEGAL,
    },
    'privacy-checklist',
);
