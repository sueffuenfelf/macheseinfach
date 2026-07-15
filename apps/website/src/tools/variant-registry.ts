import type { ToolVariant } from './types';

const allVariants: ToolVariant[] = [];

export function registerToolVariants(variants: readonly ToolVariant[]): void {
    allVariants.push(...variants);
}

export function getAllToolVariants(): readonly ToolVariant[] {
    return allVariants;
}

export function getVariantBySlug(slug: string): ToolVariant | undefined {
    return allVariants.find((variant) => variant.slug === slug);
}

export function getVariantsForTool(toolId: string): readonly ToolVariant[] {
    return allVariants.filter((variant) => variant.toolId === toolId);
}
