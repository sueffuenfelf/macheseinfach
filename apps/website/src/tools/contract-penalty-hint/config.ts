import { defineCalcTool } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL, RECHT_THEME, TRUST_LOCAL } from '../_shared/recht/theme';
import { computeContractPenaltyHint } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'contract-penalty-hint',
            slug: 'contract-penalty-hint',
            shortTitle: 'Vertragsstrafe',
            title: 'Vertragsstrafe grob prüfen',
            sub: 'Prozentsatz vom Auftragswert — Betrag und Plausibilitätshinweis.',
            pain: 'Im Vertrag steht eine Vertragsstrafe — wie hoch ist sie und ist das üblich?',
            solution: 'Auftragswert und Prozentsatz eingeben — Betrag und grobe Einschätzung.',
            trust: TRUST_LOCAL,
            tags: ['Recht', 'Vertrag', 'Rechnen'],
            keywords: ['vertragsstrafe berechnen', 'konventionalstrafe', 'vertragsstrafe prozent'],
            fileHints: [],
            command: '/vertragsstrafe',
            entry: 'form',
            entryPlaceholder: 'Auftragswert',
            theme: RECHT_THEME,
            maturity: 'stable',
            areas: ['recht'],
            storyIds: [],
        },
        fields: [
            { id: 'contractValue', type: 'currency', label: 'Auftragswert', placeholder: '5.000,00' },
            {
                id: 'penaltyPercent',
                type: 'number',
                label: 'Vertragsstrafe',
                placeholder: '10',
                suffix: '%',
            },
        ],
        compute: computeContractPenaltyHint,
        intro: `${DISCLAIMER_NO_LEGAL} Keine Prüfung der Wirksamkeit im Einzelfall.`,
    },
    'contract-penalty-hint',
);
