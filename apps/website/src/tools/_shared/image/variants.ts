import type { ToolId } from '../../data/catalog/types';
import type { ToolVariant } from '../../types';
import { getFormat, IMAGE_FORMATS, liveTargetFormats } from './formats';
import type { ImageFormatId } from './types';

const TOOL_ID: ToolId = 'image-convert';

function variantSlug(from: ImageFormatId, to: ImageFormatId): string {
    return `${from}-zu-${to}`;
}

function variantSeo(from: ImageFormatId, to: ImageFormatId): ToolVariant['seo'] {
    const fromLabel = getFormat(from).label;
    const toLabel = getFormat(to).label;
    const title = `${fromLabel} zu ${toLabel} — kostenlos im Browser`;
    return {
        title,
        description: `Wandle ${fromLabel}-Bilder in ${toLabel} um — lokal im Browser, ohne Upload.`,
        h1: `${fromLabel} zu ${toLabel} konvertieren`,
        keywords: [
            from,
            to,
            fromLabel.toLowerCase(),
            toLabel.toLowerCase(),
            'konvertieren',
            'umwandeln',
            'bild',
        ],
    };
}

/** Alle gültigen from→to-Paare aus der Format-Matrix (Phase 1). */
export function buildConversionVariants(): ToolVariant[] {
    const variants: ToolVariant[] = [];

    for (const format of Object.values(IMAGE_FORMATS)) {
        if (format.status !== 'live') continue;
        for (const to of liveTargetFormats(format.id)) {
            if (format.id === to) continue;
            const slug = variantSlug(format.id, to);
            variants.push({
                id: slug,
                toolId: TOOL_ID,
                slug,
                params: { from: format.id, to },
                seo: variantSeo(format.id, to),
            });
        }
    }

    return variants;
}

export function getConversionVariantBySlug(slug: string): ToolVariant | undefined {
    return buildConversionVariants().find((variant) => variant.slug === slug);
}
