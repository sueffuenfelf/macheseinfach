import { definePasteTool } from '../_shared/shells';
import { A11Y_THEME, TRUST_LOCAL } from '../_shared/color';
import { analyzeHeadingA11y } from './compute';

export default definePasteTool(
    {
        catalog: {
            id: 'heading-a11y',
            slug: 'heading-a11y',
            shortTitle: 'Überschriften',
            title: 'Überschriften-Hierarchie (A11y)',
            sub: 'H1–H6 Sprünge und fehlende Ebenen erkennen.',
            pain: 'Übersprungene Heading-Level verwirren Screenreader-Nutzer.',
            solution: 'HTML einfügen — Hierarchie und Warnungen lokal prüfen.',
            trust: TRUST_LOCAL,
            tags: ['A11y', 'HTML', 'Prüfen'],
            keywords: ['überschriften hierarchie', 'h1 h2 prüfung', 'heading accessibility'],
            fileHints: [],
            command: '/heading-a11y',
            entry: 'form',
            theme: A11Y_THEME,
            maturity: 'stable',
            areas: ['barrierefreiheit'],
            storyIds: ['story-ueberschriften'],
        },
        analyze: analyzeHeadingA11y,
        placeholder: '<h1>Titel</h1>\n<h2>Abschnitt</h2>',
        submitLabel: 'Hierarchie prüfen',
    },
    'heading-a11y',
);
