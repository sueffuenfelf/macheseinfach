import { defineCalcTool } from '../_shared/shells';
import { STEUERN_DISCLAIMER, STEUERN_THEME, STEUERN_TRUST } from '../_shared/steuern';
import { computeAfaLinear } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'afa-linear',
            slug: 'afa-linear',
            shortTitle: 'AfA linear',
            title: 'AfA linear berechnen',
            sub: 'Lineare Abschreibung grob — Anschaffungskosten geteilt durch Nutzungsdauer.',
            pain: 'Wie viel AfA kann ich grob pro Jahr ansetzen?',
            solution: 'Kosten und Nutzungsdauer eingeben — Jahres- und Monatsbetrag sofort sehen.',
            trust: STEUERN_TRUST,
            tags: ['Steuern', 'AfA', 'Rechnen'],
            keywords: ['afa berechnen', 'abschreibung rechner', 'afa tabelle', 'lineare afa'],
            fileHints: [],
            command: '/afa',
            entry: 'form',
            entryPlaceholder: 'Anschaffungskosten, z. B. 1.200',
            theme: STEUERN_THEME,
            maturity: 'stable',
            areas: ['steuern'],
            storyIds: ['story-afa'],
        },
        fields: [
            {
                id: 'cost',
                type: 'currency',
                label: 'Anschaffungskosten',
                placeholder: '1.200,00',
            },
            {
                id: 'years',
                type: 'number',
                label: 'Nutzungsdauer',
                placeholder: '3',
                suffix: 'Jahre',
                hint: 'Laut AfA-Tabelle bzw. betriebsgewöhnlicher Nutzungsdauer.',
            },
        ],
        compute: computeAfaLinear,
        intro: `Vereinfachte lineare AfA zur Orientierung. ${STEUERN_DISCLAIMER}`,
    },
    'afa-linear',
);
