import { defineCalcTool } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL, RECHT_THEME, TRUST_LOCAL } from '../_shared/recht/theme';
import { computeProbationEnd } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'probation-end',
            slug: 'probation-end',
            title: 'Probezeit-Ende berechnen',
            shortTitle: 'Probezeit-Ende',
            sub: 'Eintrittsdatum und Dauer — wann endet die Probezeit grob?',
            pain: 'Probezeit 6 Monate — welcher Tag ist das letzte?',
            solution: 'Eintritt und Monate eingeben — Ende der Probezeit anzeigen.',
            trust: TRUST_LOCAL,
            tags: ['Recht', 'Frist', 'Vertrag'],
            keywords: ['probezeit ende', 'probezeit berechnen', 'probezeit 6 monate'],
            fileHints: [],
            command: '/probezeit',
            entry: 'form',
            entryPlaceholder: 'Eintrittsdatum',
            theme: RECHT_THEME,
            maturity: 'stable',
            areas: ['recht'],
            storyIds: [],
        },
        fields: [
            { id: 'startDate', type: 'date', label: 'Eintrittsdatum' },
            {
                id: 'months',
                type: 'number',
                label: 'Probezeit',
                default: '6',
                suffix: 'Monate',
                hint: 'Gesetzlich max. 6 Monate.',
            },
        ],
        compute: computeProbationEnd,
        intro: `${DISCLAIMER_NO_LEGAL} Vereinfachte Monatsberechnung.`,
    },
    'probation-end',
);
