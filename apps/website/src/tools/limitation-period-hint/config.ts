import { defineCalcTool } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL, RECHT_THEME, TRUST_LOCAL } from '../_shared/recht/theme';
import { computeLimitationPeriodHint } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'limitation-period-hint',
            slug: 'limitation-period-hint',
            shortTitle: 'Verjährung grob',
            title: 'Verjährungsfrist grob berechnen',
            sub: 'Regelverjährung 3 Jahre — Stichtag zur Orientierung.',
            pain: 'Wann verjährt eine Forderung ungefähr?',
            solution: 'Datum des Ereignisses eingeben — grobes Verjährungsende anzeigen.',
            trust: TRUST_LOCAL,
            tags: ['Recht', 'Frist', 'Vertrag'],
            keywords: ['verjährungsfrist', 'wann verjährt forderung', 'verjährung berechnen'],
            fileHints: [],
            command: '/verjaehrung',
            entry: 'form',
            entryPlaceholder: 'Datum des Ereignisses',
            theme: RECHT_THEME,
            maturity: 'stable',
            areas: ['recht'],
            storyIds: ['story-verjaehrung'],
        },
        fields: [{ id: 'eventDate', type: 'date', label: 'Ereignis / Forderung entstanden' }],
        compute: computeLimitationPeriodHint,
        intro: `${DISCLAIMER_NO_LEGAL} Vereinfachte Regelverjährung (3 Jahre ab Jahresende).`,
    },
    'limitation-period-hint',
);
