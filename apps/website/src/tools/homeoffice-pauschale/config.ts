import { defineCalcTool } from '../_shared/shells';
import { STEUERN_DISCLAIMER, STEUERN_THEME, STEUERN_TRUST } from '../_shared/steuern';
import { computeHomeofficePauschale } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'homeoffice-pauschale',
            slug: 'homeoffice-pauschale',
            shortTitle: 'Homeoffice-Pauschale',
            title: 'Homeoffice-Pauschale berechnen',
            sub: 'Homeoffice-Tage × Tagespauschale — mit Jahres-Obergrenze (Stand 2025/2026).',
            pain: 'Wie viel Homeoffice-Pauschale kann ich grob ansetzen?',
            solution: 'Tage und Steuerjahr wählen — Betrag inkl. Cap sofort sehen.',
            trust: STEUERN_TRUST,
            tags: ['Steuern', 'Pauschale', 'Rechnen'],
            keywords: ['homeoffice pauschale', 'homeoffice tage berechnen', '6 euro homeoffice'],
            fileHints: [],
            command: '/homeoffice',
            entry: 'form',
            entryPlaceholder: 'Homeoffice-Tage, z. B. 180',
            theme: STEUERN_THEME,
            maturity: 'stable',
            areas: ['steuern'],
            storyIds: [],
        },
        fields: [
            {
                id: 'year',
                type: 'segment',
                label: 'Steuerjahr',
                default: '2026',
                options: [
                    { value: '2025', label: '2025' },
                    { value: '2026', label: '2026' },
                ],
            },
            {
                id: 'days',
                type: 'number',
                label: 'Homeoffice-Tage',
                placeholder: '180',
                suffix: 'Tage',
                hint: 'Max. 210 Tage / 1.260\u00a0€ (6\u00a0€/Tag).',
            },
        ],
        compute: computeHomeofficePauschale,
        intro: `Tagespauschale 6\u00a0€, Obergrenze 210 Tage (2025/2026). ${STEUERN_DISCLAIMER}`,
    },
    'homeoffice-pauschale',
);
