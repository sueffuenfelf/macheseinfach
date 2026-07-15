import type { UserStory } from './types';
import { getAllToolVariants } from '../../tools/variant-registry';

/** Synthetische Stories aus Tool-Varianten — Slug = Variant-Slug */
export function buildVariantStories(): Record<string, UserStory> {
    const result: Record<string, UserStory> = {};

    for (const variant of getAllToolVariants()) {
        const storyId = `variant-${variant.slug}` as UserStory['id'];
        result[variant.slug] = {
            id: storyId,
            slug: variant.slug,
            areaIds: ['bilder'],
            role: 'Konvertierung',
            want: `will ich ${variant.params.from?.toUpperCase() ?? 'Bilder'} in ${variant.params.to?.toUpperCase() ?? 'ein anderes Format'} umwandeln`,
            title: variant.seo.h1,
            situation: variant.seo.description,
            outcome: variant.seo.title,
            toolIds: [variant.toolId],
            status: 'ready',
        };
    }

    return result;
}

export function getVariantStoryBySlug(slug: string): UserStory | undefined {
    return buildVariantStories()[slug];
}

export function isVariantStorySlug(slug: string): boolean {
    return slug in buildVariantStories();
}
