import { defineCalcTool } from '../_shared/shells';
import { SEO_THEME } from '../_shared/seo/theme';
import { computeTitleLength } from './compute';

export default defineCalcTool(
    {
        catalog: {
            id: 'seo-title-length',
            slug: 'seo-title-length',
            shortTitle: 'Title & Meta',
            title: 'Title- und Meta-Länge',
            sub: 'Zeichenzahl und ungefähre Pixel-Breite für Title und Description — live.',
            pain: 'Title oder Description werden in Google abgeschnitten.',
            solution: 'Länge und Pixel-Schätzung sofort sehen.',
            trust: 'Lokal berechnet · nichts wird hochgeladen',
            tags: ['SEO', 'Meta', 'Prüfen'],
            keywords: ['title', 'meta', 'zeichen', 'pixel', 'länge', 'google'],
            fileHints: [],
            command: '/title-length',
            entry: 'form',
            entryPlaceholder: 'Seitentitel eingeben',
            theme: SEO_THEME,
            maturity: 'stable',
            areas: ['seo'],
            storyIds: ['story-seo-title'],
        },
        fields: [
            { id: 'title', type: 'text', label: 'Title-Tag', placeholder: 'Mein Seitentitel' },
            {
                id: 'description',
                type: 'textarea',
                label: 'Meta-Description',
                placeholder: 'Optional …',
                rows: 2,
            },
        ],
        compute: computeTitleLength,
    },
    'seo-title-length',
);
