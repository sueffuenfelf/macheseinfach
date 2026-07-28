import { definePasteTool } from '../_shared/shells';
import { SEO_THEME } from '../_shared/seo/theme';
import { analyzeSitemap } from './compute';

export default definePasteTool(
    {
        catalog: {
            id: 'seo-sitemap-check',
            slug: 'seo-sitemap-check',
            shortTitle: 'Sitemap prüfen',
            title: 'Sitemap XML prüfen',
            sub: 'Sitemap-XML einfügen — Struktur und häufige Fehler werden lokal geprüft.',
            pain: 'Sitemap-Fehler bremsen die Indexierung.',
            solution: 'XML validieren und URL-Anzahl prüfen — ohne Server-Upload.',
            trust: 'Lokal geprüft · nichts wird hochgeladen',
            tags: ['SEO', 'Sitemap', 'Prüfen'],
            keywords: ['sitemap', 'xml', 'google', 'indexierung', 'urlset'],
            fileHints: [],
            command: '/sitemap',
            entry: 'form',
            entryPlaceholder: 'Sitemap-XML einfügen',
            theme: SEO_THEME,
            maturity: 'stable',
            areas: ['seo'],
            storyIds: ['story-seo-sitemap'],
        },
        analyze: analyzeSitemap,
        placeholder: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://beispiel.de/</loc></url>\n</urlset>',
        submitLabel: 'Sitemap prüfen',
        intro: 'Kopiere den Inhalt deiner sitemap.xml hierher. Es wird nichts an einen Server gesendet.',
    },
    'seo-sitemap-check',
);
