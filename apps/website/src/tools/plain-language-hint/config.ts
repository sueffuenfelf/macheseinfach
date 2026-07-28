import { definePasteTool } from '../_shared/shells';
import { A11Y_THEME, TRUST_LOCAL } from '../_shared/color';
import { analyzePlainLanguage } from './compute';

export default definePasteTool(
    {
        catalog: {
            id: 'plain-language-hint',
            slug: 'plain-language-hint',
            shortTitle: 'Leichte Sprache',
            title: 'Leichte Sprache — grobe Prüfung',
            sub: 'Satzlänge und Fremdwörter — Hinweise für verständlichere Texte.',
            pain: 'Text soll für mehr Menschen verständlich sein.',
            solution: 'Text einfügen — Heuristik zeigt lange Sätze und komplexe Wörter.',
            trust: TRUST_LOCAL,
            tags: ['A11y', 'Text', 'Lesbarkeit', 'Prüfen'],
            keywords: ['leichte sprache prüfen', 'einfache sprache tool', 'verständlichkeit'],
            fileHints: [],
            command: '/leichtesprache',
            entry: 'form',
            theme: A11Y_THEME,
            maturity: 'stable',
            areas: ['barrierefreiheit'],
            storyIds: [],
        },
        analyze: analyzePlainLanguage,
        placeholder: 'Behördentext oder Webseiten-Absatz …',
        submitLabel: 'Text prüfen',
    },
    'plain-language-hint',
);
