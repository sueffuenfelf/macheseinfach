import { defineGenerateTool } from '../_shared/shells';
import { SEO_THEME } from '../_shared/seo/theme';
import { generateOgPreview } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'seo-og-preview',
            slug: 'seo-og-preview',
            shortTitle: 'Social Preview',
            title: 'Open-Graph-Vorschau',
            sub: 'OG-Felder ausfüllen — Vorschau und Meta-Tags für Facebook, LinkedIn & Co.',
            pain: 'Link-Vorschau auf Social Media sieht falsch aus.',
            solution: 'og:title, description und image testen — lokal im Browser.',
            trust: 'Lokal generiert · nichts wird hochgeladen',
            tags: ['SEO', 'OpenGraph', 'Meta'],
            keywords: ['open graph', 'og', 'facebook', 'linkedin', 'twitter card', 'social'],
            fileHints: [],
            command: '/og-preview',
            entry: 'form',
            entryPlaceholder: 'Titel, Beschreibung, Bild-URL',
            theme: SEO_THEME,
            maturity: 'stable',
            areas: ['seo'],
            storyIds: ['story-seo-og'],
        },
        fields: [
            { id: 'title', type: 'text', label: 'og:title', placeholder: 'Artikel-Titel' },
            {
                id: 'description',
                type: 'textarea',
                label: 'og:description',
                placeholder: 'Kurzbeschreibung für Social Shares …',
                rows: 2,
            },
            { id: 'image', type: 'text', label: 'og:image (URL)', placeholder: 'https://beispiel.de/bild.jpg' },
            { id: 'url', type: 'text', label: 'og:url', placeholder: 'https://beispiel.de/seite' },
            {
                id: 'type',
                type: 'segment',
                label: 'og:type',
                default: 'website',
                options: [
                    { value: 'website', label: 'website' },
                    { value: 'article', label: 'article' },
                ],
            },
        ],
        generate: generateOgPreview,
        isReady: (v) => Boolean(v.title?.trim() || v.description?.trim()),
        outputTitle: 'Social Preview',
    },
    'seo-og-preview',
);
