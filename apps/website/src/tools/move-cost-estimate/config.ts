import { defineCalcTool } from '../_shared/shells';
import { TRUST_LOCAL, WOHNEN_THEME } from '../_shared/wohnen/theme';
import { computeMoveCost } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'move-cost-estimate',
            slug: 'move-cost-estimate',
            shortTitle: 'Umzugskosten grob',
            title: 'Umzugskosten schätzen',
            sub: 'Grobes Budget vor dem Umzug — Fläche, Distanz, Service-Level.',
            pain: 'Unklar, was der Umzug ungefähr kostet.',
            solution: 'Angaben eingeben — Spanne erscheint lokal im Browser.',
            trust: TRUST_LOCAL,
            tags: ['Umzug', 'Rechnen'],
            keywords: [
                'umzugskostenrechner',
                'was kostet umzug',
                'umzugskosten schätzen',
                'umzug budget',
            ],
            fileHints: [],
            command: '/umzug',
            entry: 'form',
            entryPlaceholder: 'Wohnfläche …',
            theme: WOHNEN_THEME,
            maturity: 'stable',
            areas: ['wohnen'],
            storyIds: [],
        },
        fields: [
            {
                id: 'sqm',
                type: 'number',
                label: 'Wohnfläche',
                placeholder: '65',
                suffix: 'm²',
            },
            {
                id: 'km',
                type: 'number',
                label: 'Entfernung',
                placeholder: '25',
                suffix: 'km',
            },
            {
                id: 'level',
                type: 'segment',
                label: 'Service',
                default: 'mid',
                options: [
                    { value: 'self', label: 'Selbst' },
                    { value: 'mid', label: 'Spedition' },
                    { value: 'full', label: 'Vollservice' },
                ],
            },
        ],
        compute: computeMoveCost,
        intro: `${TRUST_LOCAL} Nur Schätzung — Angebote einholen.`,
    },
    'move-cost-estimate',
);
