import { defineCheckTool } from '../_shared/shells';
import { STEUERN_DISCLAIMER, STEUERN_THEME, STEUERN_TRUST } from '../_shared/steuern';
import { checkTaxDeadlines } from './compute';

export default defineCheckTool(
    {
        catalog: {
            id: 'tax-deadline-calendar',
            slug: 'tax-deadline-calendar',
            shortTitle: 'Steuerfristen',
            title: 'Steuerfristen-Kalender',
            sub: 'Nächste UStVA- und ESt-Termine (statisch) — Orientierung für 2025/2026.',
            pain: 'Wann ist die nächste Umsatzsteuervoranmeldung oder ESt-Frist?',
            solution: 'Jahr und Rhythmus wählen — nächste Termine sofort sehen.',
            trust: STEUERN_TRUST,
            tags: ['Steuern', 'Frist', 'Prüfen'],
            keywords: [
                'umsatzsteuervoranmeldung frist',
                'steuertermine 2026',
                'ustva frist',
                'einkommensteuer frist',
            ],
            fileHints: [],
            command: '/steuerfristen',
            entry: 'form',
            entryPlaceholder: 'Steuerjahr wählen',
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
                id: 'cadence',
                type: 'segment',
                label: 'UStVA-Rhythmus',
                default: 'quarterly',
                options: [
                    { value: 'quarterly', label: 'Vierteljährlich' },
                    { value: 'monthly', label: 'Monatlich' },
                ],
            },
            {
                id: 'asOf',
                type: 'date',
                label: 'Stichtag (optional)',
                hint: 'Leer = heute. Zum Testen anderer Daten setzen.',
            },
        ],
        check: checkTaxDeadlines,
        autoCheck: true,
        trustNote: STEUERN_DISCLAIMER,
    },
    'tax-deadline-calendar',
);
