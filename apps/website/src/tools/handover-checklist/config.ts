import { defineGenerateTool } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL, TRUST_LOCAL, WOHNEN_THEME } from '../_shared/wohnen/theme';
import { generateHandoverChecklist } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'handover-checklist',
            slug: 'handover-checklist',
            shortTitle: 'Übergabe-Checkliste',
            title: 'Wohnungsübergabe-Checkliste',
            sub: 'Protokoll-Hilfen bei Ein- und Auszug — lokal zum Kopieren.',
            pain: 'Bei der Übergabe vergisst man wichtige Punkte.',
            solution: 'Checkliste wählen — Text kopieren und abhaken.',
            trust: TRUST_LOCAL,
            tags: ['Miete', 'Checkliste', 'Umzug'],
            keywords: [
                'wohnungsübergabeprotokoll',
                'übergabe checkliste',
                'mängelliste wohnung',
                'wohnungsübergabe',
            ],
            fileHints: [],
            command: '/uebergabe',
            entry: 'form',
            entryPlaceholder: 'Einzug oder Auszug …',
            theme: WOHNEN_THEME,
            maturity: 'stable',
            areas: ['wohnen'],
            storyIds: [],
        },
        fields: [
            {
                id: 'kind',
                type: 'segment',
                label: 'Anlass',
                default: 'in',
                options: [
                    { value: 'in', label: 'Einzug' },
                    { value: 'out', label: 'Auszug' },
                ],
            },
        ],
        generate: generateHandoverChecklist,
        isReady: () => true,
        outputTitle: 'Checkliste',
        emptyHint: DISCLAIMER_NO_LEGAL,
    },
    'handover-checklist',
);
