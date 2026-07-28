import { definePasteTool } from '../_shared/shells';
import { SEO_THEME } from '../_shared/seo/theme';
import { analyzeStructuredData } from './compute';

export default definePasteTool(
    {
        catalog: {
            id: 'seo-structured-data',
            slug: 'seo-structured-data',
            shortTitle: 'Structured Data',
            title: 'JSON-LD prüfen',
            sub: 'Structured Data einfügen — Syntax und häufige Pflichtfelder werden geprüft.',
            pain: 'Rich Results funktionieren nicht wegen Schema-Fehlern.',
            solution: 'JSON-LD lokal parsen und fehlende Felder anzeigen.',
            trust: 'Lokal geprüft · nichts wird hochgeladen',
            tags: ['SEO', 'Schema', 'Prüfen'],
            keywords: ['json-ld', 'structured data', 'schema.org', 'rich results'],
            fileHints: [],
            command: '/json-ld',
            entry: 'form',
            entryPlaceholder: 'JSON-LD einfügen',
            theme: SEO_THEME,
            maturity: 'stable',
            areas: ['seo'],
            storyIds: [],
        },
        analyze: analyzeStructuredData,
        placeholder: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "LocalBusiness",\n  "name": "Beispiel GmbH"\n}\n</script>',
        submitLabel: 'JSON-LD prüfen',
    },
    'seo-structured-data',
);
