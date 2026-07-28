import { defineCalcTool } from '../_shared/shells';
import { SEO_THEME } from '../_shared/seo/theme';
import { computeKeywordDensity } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'seo-keyword-density',
            slug: 'seo-keyword-density',
            shortTitle: 'Keyword-Dichte',
            title: 'Keyword-Dichte berechnen',
            sub: 'Text und Keyword eingeben — Häufigkeit und Dichte live berechnen.',
            pain: 'Unklar, ob ein Keyword zu oft oder zu selten vorkommt.',
            solution: 'Wortfrequenz und Prozent-Dichte im Browser.',
            trust: 'Lokal berechnet · nichts wird hochgeladen',
            tags: ['SEO', 'Text', 'Prüfen'],
            keywords: ['keyword', 'dichte', 'density', 'wortfrequenz', 'seo text'],
            fileHints: [],
            command: '/keyword-density',
            entry: 'form',
            entryPlaceholder: 'Text und Keyword',
            theme: SEO_THEME,
            maturity: 'stable',
            areas: ['seo'],
            storyIds: [],
        },
        fields: [
            {
                id: 'text',
                type: 'textarea',
                label: 'Text',
                placeholder: 'Seitentext oder Artikel einfügen …',
                rows: 6,
            },
            { id: 'keyword', type: 'text', label: 'Keyword', placeholder: 'z. B. handwerker berlin' },
        ],
        compute: computeKeywordDensity,
    },
    'seo-keyword-density',
);
