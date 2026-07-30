import { defineCalcTool } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL, RECHT_THEME, TRUST_LOCAL } from '../_shared/recht/theme';
import { computeWithdrawalPeriod } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'withdrawal-period',
            slug: 'withdrawal-period',
            shortTitle: 'Widerrufsfrist',
            title: 'Widerrufsfrist berechnen',
            sub: 'Startdatum und Frist in Tagen — wann endet die Widerrufsfrist?',
            pain: '14 Tage Widerruf — ab wann und bis wann gilt die Frist?',
            solution: 'Erhaltsdatum und Frist eingeben — letzter Tag erscheint sofort.',
            trust: TRUST_LOCAL,
            tags: ['Recht', 'Frist', 'Widerruf', 'Vertrag'],
            keywords: ['widerrufsfrist berechnen', '14 tage widerruf', 'widerrufsrecht frist'],
            fileHints: [],
            command: '/widerruf',
            entry: 'form',
            entryPlaceholder: 'Erhaltsdatum',
            theme: RECHT_THEME,
            maturity: 'stable',
            areas: ['recht'],
            storyIds: ['story-widerruf'],
        },
        fields: [
            { id: 'startDate', type: 'date', label: 'Beginn der Frist' },
            {
                id: 'days',
                type: 'number',
                label: 'Fristdauer',
                default: '14',
                suffix: 'Tage',
                hint: 'Standard bei Fernabsatz: 14 Tage.',
            },
        ],
        compute: computeWithdrawalPeriod,
        intro: `${DISCLAIMER_NO_LEGAL} Vereinfachte Kalendertags-Rechnung.`,
    },
    'withdrawal-period',
);
