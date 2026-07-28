import { definePasteTool } from '../_shared/shells';
import { SEO_THEME } from '../_shared/seo/theme';
import { analyzeHeadings } from './compute';

export default definePasteTool(
    {
        catalog: {
            id: 'seo-heading-outline',
            slug: 'seo-heading-outline',
            shortTitle: 'Überschriften',
            title: 'Überschriften-Gliederung',
            sub: 'HTML einfügen — H1 bis H6 als Gliederung mit Hinweisen.',
            pain: 'Unklare Überschriften-Hierarchie schadet SEO und Barrierefreiheit.',
            solution: 'Heading-Outline lokal aus HTML extrahieren.',
            trust: 'Lokal analysiert · nichts wird hochgeladen',
            tags: ['SEO', 'Text', 'Prüfen'],
            keywords: ['h1', 'h2', 'überschrift', 'heading', 'gliederung', 'html'],
            fileHints: [],
            command: '/headings',
            entry: 'form',
            entryPlaceholder: 'HTML-Quelltext einfügen',
            theme: SEO_THEME,
            maturity: 'stable',
            areas: ['seo'],
            storyIds: [],
        },
        analyze: analyzeHeadings,
        placeholder: '<h1>Haupttitel</h1>\n<h2>Abschnitt</h2>\n<h3>Unterabschnitt</h3>',
        submitLabel: 'Gliederung anzeigen',
    },
    'seo-heading-outline',
);
