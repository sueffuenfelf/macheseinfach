import { defineGenerateTool } from '../_shared/shells';
import { SEO_THEME } from '../_shared/seo/theme';
import { generateMetaPreview } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'seo-meta-preview',
            slug: 'seo-meta-preview',
            shortTitle: 'Google-Vorschau',
            title: 'Google-Snippet-Vorschau',
            sub: 'Title und Meta-Description eingeben — so könnte dein Eintrag in Google aussehen.',
            pain: 'Unsicher, ob Titel und Description in den Suchergebnissen gut wirken.',
            solution: 'Snippet-Vorschau live im Browser — ohne Upload deiner Seite.',
            trust: 'Lokal generiert · nichts wird hochgeladen',
            tags: ['SEO', 'Meta', 'Prüfen'],
            keywords: ['google', 'snippet', 'meta', 'title', 'description', 'vorschau', 'serp'],
            fileHints: [],
            command: '/meta-preview',
            entry: 'form',
            entryPlaceholder: 'Seitentitel und Meta-Description',
            theme: SEO_THEME,
            maturity: 'stable',
            areas: ['seo'],
            storyIds: ['story-seo-meta-preview'],
        },
        fields: [
            { id: 'title', type: 'text', label: 'Title-Tag', placeholder: 'Meine Seite — Kurz und klar' },
            {
                id: 'description',
                type: 'textarea',
                label: 'Meta-Description',
                placeholder: 'Beschreibung in 1–2 Sätzen …',
                rows: 3,
            },
            {
                id: 'url',
                type: 'text',
                label: 'URL (optional)',
                placeholder: 'https://beispiel.de/seite',
                default: '',
            },
        ],
        generate: generateMetaPreview,
        isReady: (v) => Boolean(v.title?.trim() || v.description?.trim()),
        outputTitle: 'Snippet-Vorschau',
        emptyHint: 'Title oder Description eingeben — die Vorschau erscheint hier.',
    },
    'seo-meta-preview',
);
