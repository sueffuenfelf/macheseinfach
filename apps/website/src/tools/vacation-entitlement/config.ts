import { defineCalcTool } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL, RECHT_THEME, TRUST_LOCAL } from '../_shared/recht/theme';
import { computeVacationEntitlement } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'vacation-entitlement',
            slug: 'vacation-entitlement',
            shortTitle: 'Urlaubsanspruch',
            title: 'Urlaubsanspruch grob berechnen',
            sub: 'Teiljahr und 5- oder 6-Tage-Woche — anteiliger Mindestanspruch.',
            pain: 'Im ersten Halbjahr gearbeitet — wie viel Urlaub steht grob zu?',
            solution: 'Arbeitstage und Monate eingeben — anteiligen Anspruch anzeigen.',
            trust: TRUST_LOCAL,
            tags: ['Recht', 'Rechnen', 'Vertrag'],
            keywords: ['urlaubsanspruch berechnen', 'urlaub anteilig', 'urlaub teiljahr'],
            fileHints: [],
            command: '/urlaub',
            entry: 'form',
            entryPlaceholder: 'Monate im Jahr',
            theme: RECHT_THEME,
            maturity: 'stable',
            areas: ['recht'],
            storyIds: [],
        },
        fields: [
            {
                id: 'workDaysPerWeek',
                type: 'segment',
                label: 'Arbeitstage/Woche',
                default: '5',
                options: [
                    { value: '5', label: '5 Tage' },
                    { value: '6', label: '6 Tage' },
                ],
            },
            {
                id: 'months',
                type: 'number',
                label: 'Monate im Jahr',
                default: '12',
                suffix: 'Monate',
            },
        ],
        compute: computeVacationEntitlement,
        intro: `${DISCLAIMER_NO_LEGAL} Mindesturlaub nach BUrlG vereinfacht.`,
    },
    'vacation-entitlement',
);
