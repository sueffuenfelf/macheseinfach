import { defineCalcTool } from '../_shared/shells';
import { TRUST_LOCAL, ZEIT_THEME } from '../_shared/zeit/theme';
import { computeAge } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'age-calculator',
            slug: 'age-calculator',
            shortTitle: 'Alter berechnen',
            title: 'Alter am Stichtag berechnen',
            sub: 'Jahre, Monate und Tage — für Formulare und Fristen.',
            pain: 'Formular fragt „Alter am Stichtag“ — wie alt bin ich genau?',
            solution: 'Geburtsdatum und Stichtag wählen — Alter erscheint sofort.',
            trust: TRUST_LOCAL,
            tags: ['Zeit', 'Zähler'],
            keywords: ['alter berechnen', 'wie alt bin ich', 'alter stichtag', 'geburtsdatum alter'],
            fileHints: [],
            command: '/alter',
            entry: 'form',
            entryPlaceholder: 'Geburtsdatum',
            theme: ZEIT_THEME,
            maturity: 'stable',
            areas: ['zeit'],
            storyIds: [],
        },
        fields: [
            { id: 'birth', type: 'date', label: 'Geburtsdatum' },
            {
                id: 'reference',
                type: 'date',
                label: 'Stichtag',
                hint: 'Leer = heute',
            },
        ],
        compute: computeAge,
        intro: 'Berechnet das Alter in Jahren, Monaten und Tagen am gewählten Stichtag.',
    },
    'age-calculator',
);
