import { definePasteTool } from '../_shared/shells';
import { SEO_THEME } from '../_shared/seo/theme';
import { analyzeHreflang } from './compute';

export default definePasteTool(
    {
        catalog: {
            id: 'seo-hreflang-check',
            slug: 'seo-hreflang-check',
            shortTitle: 'hreflang',
            title: 'hreflang prüfen',
            sub: 'HTML einfügen — alternate-Links mit hreflang auswerten.',
            pain: 'Falsche hreflang-Tags verwirren Google bei mehrsprachigen Sites.',
            solution: 'Alle hreflang-Einträge finden und Dubletten melden.',
            trust: 'Lokal analysiert · nichts wird hochgeladen',
            tags: ['SEO', 'Meta', 'Prüfen'],
            keywords: ['hreflang', 'alternate', 'mehrsprachig', 'international seo'],
            fileHints: [],
            command: '/hreflang',
            entry: 'form',
            entryPlaceholder: 'HTML mit hreflang-Links',
            theme: SEO_THEME,
            maturity: 'stable',
            areas: ['seo'],
            storyIds: [],
        },
        analyze: analyzeHreflang,
        placeholder:
            '<link rel="alternate" hreflang="de" href="https://beispiel.de/" />\n<link rel="alternate" hreflang="en" href="https://beispiel.de/en/" />\n<link rel="alternate" hreflang="x-default" href="https://beispiel.de/" />',
        submitLabel: 'hreflang prüfen',
    },
    'seo-hreflang-check',
);
