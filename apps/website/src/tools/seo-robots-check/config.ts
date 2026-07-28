import { definePasteTool } from '../_shared/shells';
import { SEO_THEME } from '../_shared/seo/theme';
import { analyzeRobotsTxt } from './compute';

export default definePasteTool(
    {
        catalog: {
            id: 'seo-robots-check',
            slug: 'seo-robots-check',
            shortTitle: 'robots.txt',
            title: 'robots.txt prüfen',
            sub: 'robots.txt einfügen — Allow/Disallow und Sitemap-Zeilen werden ausgewertet.',
            pain: 'Falsche robots.txt blockiert wichtige Seiten.',
            solution: 'Regeln lokal parsen und Warnungen anzeigen.',
            trust: 'Lokal geprüft · nichts wird hochgeladen',
            tags: ['SEO', 'Robots', 'Prüfen'],
            keywords: ['robots', 'robots.txt', 'disallow', 'allow', 'crawler'],
            fileHints: [],
            command: '/robots',
            entry: 'form',
            entryPlaceholder: 'robots.txt einfügen',
            theme: SEO_THEME,
            maturity: 'stable',
            areas: ['seo'],
            storyIds: [],
        },
        analyze: analyzeRobotsTxt,
        placeholder: 'User-agent: *\nDisallow: /admin/\nSitemap: https://beispiel.de/sitemap.xml',
        submitLabel: 'robots.txt prüfen',
    },
    'seo-robots-check',
);
