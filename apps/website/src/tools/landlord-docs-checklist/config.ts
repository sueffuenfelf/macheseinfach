import { defineGenerateTool } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL, TRUST_LOCAL, WOHNEN_THEME } from '../_shared/wohnen/theme';
import { generateLandlordDocsChecklist } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'landlord-docs-checklist',
            slug: 'landlord-docs-checklist',
            shortTitle: 'Vermieter-Unterlagen',
            title: 'Unterlagen für den Vermieter',
            sub: 'Was wird oft verlangt — Checkliste zum Abhaken.',
            pain: 'Unklar, welche Nachweise der Vermieter erwartet.',
            solution: 'Checkliste erzeugen — lokal kopieren und vorbereiten.',
            trust: TRUST_LOCAL,
            tags: ['Vermieter', 'Checkliste', 'Miete'],
            keywords: [
                'unterlagen vermieter',
                'was braucht vermieter',
                'einkommensnachweis miete',
                'mietbewerbung unterlagen',
            ],
            fileHints: [],
            command: '/vermieter-docs',
            entry: 'form',
            entryPlaceholder: 'Checkliste …',
            theme: WOHNEN_THEME,
            maturity: 'stable',
            areas: ['wohnen'],
            storyIds: ['story-vermieter-nachweis'],
        },
        fields: [
            {
                id: 'role',
                type: 'segment',
                label: 'Perspektive',
                default: 'tenant',
                options: [
                    { value: 'tenant', label: 'Mieter:in' },
                    { value: 'landlord', label: 'Vermieter:in' },
                ],
            },
        ],
        generate: generateLandlordDocsChecklist,
        isReady: () => true,
        outputTitle: 'Checkliste',
        emptyHint: DISCLAIMER_NO_LEGAL,
    },
    'landlord-docs-checklist',
);
