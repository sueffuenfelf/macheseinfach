import { defineGenerateTool } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL, RECHT_THEME, TRUST_LOCAL } from '../_shared/recht/theme';
import { generateImpressumChecklist } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'impressum-checklist',
            slug: 'impressum-checklist',
            shortTitle: 'Impressum-Checkliste',
            title: 'Impressum-Checkliste',
            sub: 'Pflichtangaben grob — TMG/DDG-Orientierung, kein Generator.',
            pain: 'Was muss ins Impressum — und was vergess ich oft?',
            solution: 'Website-Typ wählen — Checkliste zum Abhaken erzeugen.',
            trust: TRUST_LOCAL,
            tags: ['Recht', 'Impressum', 'Checkliste', 'Web'],
            keywords: ['impressum generator', 'impressum pflichtangaben', 'was muss ins impressum'],
            fileHints: [],
            command: '/impressum',
            entry: 'form',
            entryPlaceholder: 'Website-Typ …',
            theme: RECHT_THEME,
            maturity: 'stable',
            areas: ['recht'],
            storyIds: [],
        },
        fields: [
            {
                id: 'siteType',
                type: 'segment',
                label: 'Website-Typ',
                default: 'business',
                options: [
                    { value: 'business', label: 'Gewerblich' },
                    { value: 'blog', label: 'Blog / Medien' },
                    { value: 'private', label: 'Privat' },
                ],
            },
        ],
        generate: generateImpressumChecklist,
        isReady: () => true,
        outputTitle: 'Checkliste',
        emptyHint: DISCLAIMER_NO_LEGAL,
    },
    'impressum-checklist',
);
