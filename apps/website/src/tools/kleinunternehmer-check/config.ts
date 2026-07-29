import { defineCalcTool } from '../_shared/shells';
import { computeKleinunternehmerCheck } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'kleinunternehmer-check',
            slug: 'kleinunternehmer-check',
            shortTitle: 'Kleinunternehmer',
            title: 'Kleinunternehmer-Check',
            sub: 'Umsatz gegen §19 UStG-Grenzen prüfen — mit Hinweis, kein Steuerbescheid.',
            pain: 'Bin ich noch Kleinunternehmer — oder rutsche ich über die Umsatzgrenze?',
            solution: 'Vorjahres- und/oder laufenden Jahresumsatz eingeben — Grenzstatus sofort sehen.',
            trust: 'Lokal geprüft · nichts wird hochgeladen · keine Steuerberatung',
            tags: ['Freelancer', 'Prüfen', 'Steuern'],
            keywords: [
                'kleinunternehmer',
                '§19',
                'ustg',
                'umsatzgrenze',
                '25000',
                '100000',
                'kleinunternehmerregelung',
                'kleinunternehmer grenze',
            ],
            fileHints: [],
            command: '/kleinunternehmer',
            entry: 'form',
            entryPlaceholder: 'Umsatz, z. B. 20.000',
            theme: { accent: '#ff90e8', accentStrong: '#000', accentSoft: '#ffe3f7' },
            maturity: 'stable',
            areas: ['buchhaltung', 'steuern'],
            storyIds: ['story-kleinunternehmer-steuer'],
        },
        fields: [
            {
                id: 'previousYear',
                type: 'currency',
                label: 'Umsatz Vorjahr',
                placeholder: '20.000,00',
                hint: 'Umsatz im vergangenen Kalenderjahr (Grenze: 25.000\u00a0€).',
            },
            {
                id: 'currentYear',
                type: 'currency',
                label: 'Umsatz laufendes Jahr',
                placeholder: '15.000,00',
                hint: 'Prognose oder Ist-Umsatz im aktuellen Jahr (Grenze: 100.000\u00a0€).',
            },
        ],
        compute: computeKleinunternehmerCheck,
        intro: 'Vergleicht deinen Umsatz mit den §19 UStG-Grenzen (Stand 2025/2026). Keine Steuerberatung.',
    },
    'kleinunternehmer-check',
);
