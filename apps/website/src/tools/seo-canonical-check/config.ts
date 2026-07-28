import { definePasteTool } from '../_shared/shells';
import { SEO_THEME } from '../_shared/seo/theme';
import { analyzeCanonical } from './compute';

export default definePasteTool(
    {
        catalog: {
            id: 'seo-canonical-check',
            slug: 'seo-canonical-check',
            shortTitle: 'Canonical',
            title: 'Canonical-Tag prüfen',
            sub: 'HTML einfügen — canonical-Link finden und Dubletten erkennen.',
            pain: 'Falsche oder doppelte canonicals verwirren Google.',
            solution: 'rel=canonical aus dem Head extrahieren und prüfen.',
            trust: 'Lokal analysiert · nichts wird hochgeladen',
            tags: ['SEO', 'Meta', 'Prüfen'],
            keywords: ['canonical', 'duplicate', 'href', 'dubletten'],
            fileHints: [],
            command: '/canonical',
            entry: 'form',
            entryPlaceholder: 'HTML mit <head> einfügen',
            theme: SEO_THEME,
            maturity: 'stable',
            areas: ['seo'],
            storyIds: [],
        },
        analyze: analyzeCanonical,
        placeholder: '<link rel="canonical" href="https://beispiel.de/seite" />',
        submitLabel: 'Canonical prüfen',
    },
    'seo-canonical-check',
);
