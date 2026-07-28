import { defineCheckTool } from '../_shared/shells';
import { DISCLAIMER_NO_LEGAL, RECHT_THEME, TRUST_LOCAL } from '../_shared/recht/theme';
import { checkRetentionPeriod } from './compute';

export default defineCheckTool(
    {
        catalog: {
            id: 'retention-period-hint',
            slug: 'retention-period-hint',
            shortTitle: 'Aufbewahrungsfristen',
            title: 'Aufbewahrungsfristen grob',
            sub: '6 oder 10 Jahre — Belegtyp zur Orientierung.',
            pain: 'Wie lange muss ich Rechnungen und Verträge aufbewahren?',
            solution: 'Dokumenttyp wählen — grobe Frist und Rechtsgrundlage anzeigen.',
            trust: TRUST_LOCAL,
            tags: ['Recht', 'Rechnung', 'Vertrag', 'Prüfen'],
            keywords: ['aufbewahrungsfrist rechnungen', 'wie lange belege aufbewahren', 'aufbewahrungsfrist verträge'],
            fileHints: [],
            command: '/aufbewahrung',
            entry: 'form',
            entryPlaceholder: 'Belegtyp …',
            theme: RECHT_THEME,
            maturity: 'stable',
            areas: ['recht'],
            storyIds: [],
        },
        fields: [
            {
                id: 'documentType',
                type: 'segment',
                label: 'Dokumenttyp',
                default: 'invoice',
                options: [
                    { value: 'invoice', label: 'Rechnung / Beleg' },
                    { value: 'letter', label: 'Geschäftsbrief' },
                    { value: 'contract', label: 'Vertrag' },
                    { value: 'payroll', label: 'Lohnunterlage' },
                    { value: 'email', label: 'Geschäfts-E-Mail' },
                ],
            },
        ],
        check: checkRetentionPeriod,
        autoCheck: true,
        trustNote: `${TRUST_LOCAL} ${DISCLAIMER_NO_LEGAL}`,
    },
    'retention-period-hint',
);
