import { defineCalcTool } from '../_shared/shells';
import { TRUST_LOCAL, ZEIT_THEME } from '../_shared/zeit/theme';
import { computeWorkingHours } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'working-hours',
            slug: 'working-hours',
            shortTitle: 'Arbeitszeit',
            title: 'Stunden zwischen Uhrzeiten',
            sub: 'Schicht und Arbeitszeit grob berechnen — mit optionaler Pause.',
            pain: 'Von 9:00 bis 17:30 mit 45 Min Pause — wie viele Stunden?',
            solution: 'Beginn, Ende und Pause eingeben — Netto-Arbeitszeit sofort.',
            trust: TRUST_LOCAL,
            tags: ['Zeit', 'Zähler'],
            keywords: [
                'stunden zwischen uhrenzeiten',
                'arbeitszeit berechnen',
                'schicht stunden',
                'arbeitsstunden rechner',
            ],
            fileHints: [],
            command: '/arbeitszeit',
            entry: 'form',
            entryPlaceholder: '09:00 – 17:00',
            theme: ZEIT_THEME,
            maturity: 'stable',
            areas: ['zeit'],
            storyIds: [],
        },
        fields: [
            { id: 'start', type: 'text', label: 'Beginn', placeholder: '09:00', default: '09:00' },
            { id: 'end', type: 'text', label: 'Ende', placeholder: '17:00', default: '17:00' },
            {
                id: 'breakMin',
                type: 'number',
                label: 'Pause',
                placeholder: '0',
                default: '0',
                suffix: 'min',
            },
        ],
        compute: computeWorkingHours,
        intro: 'Berechnet die Netto-Arbeitszeit. Liegt das Ende vor dem Beginn, wird ein Folgetag angenommen.',
    },
    'working-hours',
);
