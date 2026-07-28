import { defineCalcTool } from '../_shared/shells';
import { TRUST_LOCAL, WOHNEN_THEME } from '../_shared/wohnen/theme';
import { computeLivingSpace } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'living-space',
            slug: 'living-space',
            shortTitle: 'Wohnfläche',
            title: 'Wohnfläche aus Maßen',
            sub: 'Quadratmeter aus Rechteck oder L-Form grob berechnen.',
            pain: 'Nur Raummaße — will schnell m² schätzen.',
            solution: 'Breite und Länge eingeben — Fläche erscheint sofort.',
            trust: TRUST_LOCAL,
            tags: ['Miete', 'Rechnen'],
            keywords: [
                'wohnfläche berechnen',
                'quadratmeter rechnen',
                'wohnfläche berechnung',
                'raumfläche',
            ],
            fileHints: [],
            command: '/wohnflaeche',
            entry: 'form',
            entryPlaceholder: 'Breite × Länge …',
            theme: WOHNEN_THEME,
            maturity: 'stable',
            areas: ['wohnen'],
            storyIds: [],
        },
        fields: [
            {
                id: 'shape',
                type: 'segment',
                label: 'Form',
                default: 'rect',
                options: [
                    { value: 'rect', label: 'Rechteck' },
                    { value: 'l', label: 'L-Form' },
                ],
            },
            {
                id: 'w1',
                type: 'number',
                label: 'Breite A (m)',
                placeholder: '4,50',
                suffix: 'm',
            },
            {
                id: 'l1',
                type: 'number',
                label: 'Länge A (m)',
                placeholder: '5,00',
                suffix: 'm',
            },
            {
                id: 'w2',
                type: 'number',
                label: 'Breite B (m, L-Form)',
                placeholder: '2,00',
                suffix: 'm',
                hint: 'Nur bei L-Form nötig.',
            },
            {
                id: 'l2',
                type: 'number',
                label: 'Länge B (m, L-Form)',
                placeholder: '3,00',
                suffix: 'm',
            },
        ],
        compute: computeLivingSpace,
        intro: `${TRUST_LOCAL} Keine Wohnflächenverordnung — nur grobe Geometrie.`,
    },
    'living-space',
);
