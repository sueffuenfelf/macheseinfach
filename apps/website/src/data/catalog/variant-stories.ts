import { getAllToolVariants } from '../../tools/variant-registry';

/** True when the URL segment is a conversion-variant slug (e.g. heic-zu-png). */
export function isVariantStorySlug(slug: string): boolean {
    return getAllToolVariants().some((variant) => variant.slug === slug);
}

export function getVariantStoryBySlug(slug: string): undefined {
    void slug;
    return undefined;
}
