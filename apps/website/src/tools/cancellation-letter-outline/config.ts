import { defineGenerateTool } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL, RECHT_THEME, TRUST_LOCAL } from '../_shared/recht/theme';
import { generateCancellationLetterOutline } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'cancellation-letter-outline',
            slug: 'cancellation-letter-outline',
            shortTitle: 'Kündigungsschreiben',
            title: 'Kündigungsschreiben — Gerüst',
            sub: 'Struktur und Abschnitte — kein fertiger Rechtsbrief.',
            pain: 'Kündigen — wie soll der Brief aufgebaut sein?',
            solution: 'Vertragstyp wählen — Gliederung und Platzhalter erzeugen.',
            trust: TRUST_LOCAL,
            tags: ['Recht', 'Vertrag', 'Schreiben', 'Checkliste'],
            keywords: ['kündigung schreiben vorlage', 'kündigung muster struktur', 'kündigungsschreiben aufbau'],
            fileHints: [],
            command: '/kuendigung-geruest',
            entry: 'form',
            entryPlaceholder: 'Vertragstyp …',
            theme: RECHT_THEME,
            maturity: 'stable',
            areas: ['recht'],
            storyIds: [],
        },
        fields: [
            {
                id: 'contractType',
                type: 'segment',
                label: 'Vertragstyp',
                default: 'service',
                options: [
                    { value: 'employment', label: 'Arbeit' },
                    { value: 'rent', label: 'Miete' },
                    { value: 'service', label: 'Dienstleistung' },
                    { value: 'gym', label: 'Fitnessstudio' },
                ],
            },
        ],
        generate: generateCancellationLetterOutline,
        isReady: () => true,
        outputTitle: 'Gerüst',
        emptyHint: DISCLAIMER_NO_LEGAL,
    },
    'cancellation-letter-outline',
);
