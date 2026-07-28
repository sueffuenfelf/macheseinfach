import { defineCalcTool } from '../_shared/shells';
import { STEUERN_DISCLAIMER, STEUERN_THEME, STEUERN_TRUST } from '../_shared/steuern';
import { computeChildBenefitHint } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'child-benefit-hint',
            slug: 'child-benefit-hint',
            shortTitle: 'Kindergeld-Orientierung',
            title: 'Kindergeld-Höhe (Orientierung)',
            sub: 'Monatlicher Satz × Anzahl — keine Anspruchsprüfung, Stand 2025/2026.',
            pain: 'Wie hoch ist Kindergeld aktuell ungefähr?',
            solution: 'Jahr und Anzahl eingeben — Monats- und Jahresbetrag sehen.',
            trust: STEUERN_TRUST,
            tags: ['Steuern', 'Kindergeld', 'Rechnen'],
            keywords: ['kindergeld höhe', 'kindergeld berechnen', 'kindergeld 2026'],
            fileHints: [],
            command: '/kindergeld',
            entry: 'form',
            entryPlaceholder: 'Anzahl Kinder',
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
                    { value: '2025', label: '2025 (255\u00a0€)' },
                    { value: '2026', label: '2026 (259\u00a0€)' },
                ],
            },
            {
                id: 'count',
                type: 'number',
                label: 'Anzahl Kinder',
                placeholder: '2',
                default: '1',
            },
            {
                id: 'age',
                type: 'number',
                label: 'Alter (optional)',
                placeholder: 'z. B. 12',
                suffix: 'Jahre',
                hint: 'Nur Hinweistext — keine Anspruchsprüfung.',
            },
        ],
        compute: computeChildBenefitHint,
        intro: `Einheitlicher Satz pro Kind (2025: 255\u00a0€, 2026: 259\u00a0€). ${STEUERN_DISCLAIMER}`,
    },
    'child-benefit-hint',
);
