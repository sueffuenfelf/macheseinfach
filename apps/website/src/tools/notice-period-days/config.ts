import { defineCalcTool } from '../_shared/shells';
import { TRUST_LOCAL, ZEIT_THEME } from '../_shared/zeit/theme';
import { computeNoticePeriod } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'notice-period-days',
            slug: 'notice-period-days',
            shortTitle: 'Kündigungsfrist',
            title: 'Kündigungsfrist berechnen (generisch)',
            sub: 'X Wochen zum Monatsende — grobe Orientierung ohne Rechtsberatung.',
            pain: '„4 Wochen zum Monatsende“ — wann endet die Frist?',
            solution: 'Kündigungsdatum und Wochen eingeben — frühestes Monatsende anzeigen.',
            trust: TRUST_LOCAL,
            tags: ['Zeit', 'Frist', 'Vertrag'],
            keywords: [
                'kündigungsfrist berechnen',
                'frist monatsende',
                'kündigung frist',
                'wochenfrist',
            ],
            fileHints: [],
            command: '/kuendigungsfrist',
            entry: 'form',
            entryPlaceholder: 'Kündigungsdatum',
            theme: ZEIT_THEME,
            maturity: 'stable',
            areas: ['zeit'],
        },
        fields: [
            { id: 'noticeDate', type: 'date', label: 'Kündigungsdatum' },
            {
                id: 'weeks',
                type: 'number',
                label: 'Frist',
                placeholder: '4',
                default: '4',
                suffix: 'Wochen',
            },
        ],
        compute: computeNoticePeriod,
        intro: 'Generische Berechnung: Kündigung + X Wochen → Monatsende dieses Monats. Kein Ersatz für Vertragsrecht.',
    },
    'notice-period-days',
);
