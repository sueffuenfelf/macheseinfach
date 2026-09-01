/** Conversion-format hub under Bilder — not a multi-tool journey. */
export const CONVERSION_HUB_SLUG = 'format-aendern';

export function isConversionHubSlug(areaId: string, slug: string): boolean {
    return areaId === 'bilder' && slug === CONVERSION_HUB_SLUG;
}
