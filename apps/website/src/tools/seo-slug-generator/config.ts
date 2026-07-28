import { defineGenerateTool } from '../_shared/shells';
import { SEO_THEME } from '../_shared/seo/theme';
import { generateSlug } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'seo-slug-generator',
            slug: 'seo-slug-generator',
            shortTitle: 'URL-Slug',
            title: 'URL-Slug Generator',
            sub: 'Deutschen Titel eingeben — SEO-freundlichen URL-Slug erzeugen.',
            pain: 'URLs mit Umlauten und Leerzeichen sind unschön und fehleranfällig.',
            solution: 'Slug mit Umlaut-Umschreibung (ä→ae) und Bindestrichen.',
            trust: 'Lokal generiert · nichts wird hochgeladen',
            tags: ['SEO', 'Text'],
            keywords: ['slug', 'url', 'permalink', 'umlaut', 'seo url'],
            fileHints: [],
            command: '/slug',
            entry: 'form',
            entryPlaceholder: 'Seitentitel auf Deutsch',
            theme: SEO_THEME,
            maturity: 'stable',
            areas: ['seo'],
            storyIds: [],
        },
        fields: [
            {
                id: 'title',
                type: 'text',
                label: 'Seitentitel',
                placeholder: 'Müller & Söhne — Handwerk in München',
            },
        ],
        generate: generateSlug,
        isReady: (v) => Boolean(v.title?.trim()),
        outputTitle: 'URL-Slug',
    },
    'seo-slug-generator',
);
