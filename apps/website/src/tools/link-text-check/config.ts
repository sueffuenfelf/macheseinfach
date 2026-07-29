import { definePasteTool } from '../_shared/shells';
import { A11Y_THEME, TRUST_LOCAL } from '../_shared/color';
import { analyzeLinkText } from './compute';

export default definePasteTool(
    {
        catalog: {
            id: 'link-text-check',
            slug: 'link-text-check',
            shortTitle: 'Linktext',
            title: 'Linktexte prüfen',
            sub: '„Hier klicken“ und andere unklare Linktexte erkennen.',
            pain: 'Screenreader lesen Links isoliert — „hier“ sagt nichts.',
            solution: 'HTML einfügen — Linktexte und Warnungen werden angezeigt.',
            trust: TRUST_LOCAL,
            tags: ['A11y', 'HTML', 'Prüfen'],
            keywords: ['barrierefreie links', 'linktext prüfen', 'hier klicken'],
            fileHints: [],
            command: '/linktext',
            entry: 'form',
            theme: A11Y_THEME,
            maturity: 'stable',
            areas: ['barrierefreiheit'],
            storyIds: ['story-link-text'],
        },
        analyze: analyzeLinkText,
        placeholder: '<a href="/kontakt">Kontakt aufnehmen</a>',
        submitLabel: 'Links prüfen',
    },
    'link-text-check',
);
