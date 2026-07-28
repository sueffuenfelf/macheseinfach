import type { UserStory } from './types';
import { getAllToolVariants } from '../../tools/variant-registry';
import { tools } from './tools';

/** Synthetische Stories aus Tool-Varianten — Slug = Variant-Slug (1-Tool-Shortcuts; FLOW_MIN_STEPS exempt) */
export function buildVariantStories(): Record<string, UserStory> {
    const result: Record<string, UserStory> = {};

    for (const variant of getAllToolVariants()) {
        const storyId = `variant-${variant.slug}` as UserStory['id'];
        const tool = tools[variant.toolId];
        result[variant.slug] = {
            id: storyId,
            slug: variant.slug,
            areaIds: ['bilder'],
            role: 'Konvertierung',
            want: `will ich ${variant.params.from?.toUpperCase() ?? 'Bilder'} in ${variant.params.to?.toUpperCase() ?? 'ein anderes Format'} umwandeln`,
            title: variant.seo.h1,
            situation: variant.seo.description,
            outcome: variant.seo.title,
            steps: [
                {
                    toolId: variant.toolId,
                    label: tool?.shortTitle ?? variant.toolId,
                },
            ],
            recommended: [],
            context: { slots: [] },
            stepBindings: {},
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

export function isVariantFlowId(id: string): boolean {
    return id.startsWith('variant-');
}
