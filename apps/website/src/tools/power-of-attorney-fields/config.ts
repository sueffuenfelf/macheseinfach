import { defineGenerateTool } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL, RECHT_THEME, TRUST_LOCAL } from '../_shared/recht/theme';
import { generatePowerOfAttorneyFields } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'power-of-attorney-fields',
            slug: 'power-of-attorney-fields',
            shortTitle: 'Vollmacht-Felder',
            title: 'Vollmacht — welche Felder braucht sie?',
            sub: 'Struktur und Pflichtangaben — kein fertiges Dokument.',
            pain: 'Vollmacht schreiben — was muss unbedingt rein?',
            solution: 'Vollmacht-Typ wählen — Feldliste zum Abhaken.',
            trust: TRUST_LOCAL,
            tags: ['Recht', 'Vertrag', 'Checkliste', 'Formular'],
            keywords: ['vollmacht vorlage', 'vollmacht muster inhalte', 'vollmacht felder'],
            fileHints: [],
            command: '/vollmacht',
            entry: 'form',
            entryPlaceholder: 'Vollmacht-Typ …',
            theme: RECHT_THEME,
            maturity: 'stable',
            areas: ['recht'],
            storyIds: [],
        },
        fields: [
            {
                id: 'type',
                type: 'segment',
                label: 'Vollmacht-Typ',
                default: 'general',
                options: [
                    { value: 'general', label: 'Allgemein' },
                    { value: 'specific', label: 'Einzelvollmacht' },
                    { value: 'prokura', label: 'Prokura' },
                ],
            },
        ],
        generate: generatePowerOfAttorneyFields,
        isReady: () => true,
        outputTitle: 'Feldliste',
        emptyHint: DISCLAIMER_NO_LEGAL,
    },
    'power-of-attorney-fields',
);
