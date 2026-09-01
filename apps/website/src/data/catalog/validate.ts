import { areas } from './areas';
import { catalogTags } from './tags';
import { tools } from './tools';
import { getAllToolVariants } from '../../tools/variant-registry';
import type { AreaId, CatalogValidationIssue, CatalogValidationResult, ToolId } from './types';

function issue(code: string, message: string): CatalogValidationIssue {
    return { code, message };
}

export function validateCatalog(): CatalogValidationResult {
    const issues: CatalogValidationIssue[] = [];

    const areaSlugs = new Set<string>();
    for (const area of Object.values(areas)) {
        if (areaSlugs.has(area.slug)) {
            issues.push(issue('DUPLICATE_AREA_SLUG', `Doppelter Bereichs-Slug „${area.slug}“`));
        }
        areaSlugs.add(area.slug);
    }

    for (const variant of getAllToolVariants()) {
        if (!tools[variant.toolId as ToolId]) {
            issues.push(
                issue(
                    'VARIANT_UNKNOWN_TOOL',
                    `Variant „${variant.slug}“ referenziert unbekanntes Tool ${variant.toolId}`,
                ),
            );
        }
    }

    const toolSlugs = new Set<string>();
    for (const tool of Object.values(tools)) {
        if (toolSlugs.has(tool.slug)) {
            issues.push(issue('DUPLICATE_TOOL_SLUG', `Doppelter Tool-Slug „${tool.slug}“`));
        }
        toolSlugs.add(tool.slug);

        for (const tag of tool.tags) {
            if (!catalogTags[tag as keyof typeof catalogTags]) {
                issues.push(
                    issue('TOOL_UNKNOWN_TAG', `Tool ${tool.id} nutzt unregistrierten Tag „${tag}“`),
                );
            }
        }

        if (tool.areas.length === 0) {
            issues.push(issue('TOOL_NO_AREAS', `Tool ${tool.id} hat keine areas`));
        }

        for (const areaId of tool.areas) {
            if (!areas[areaId as AreaId]) {
                issues.push(
                    issue(
                        'TOOL_UNKNOWN_AREA',
                        `Tool ${tool.id} referenziert unbekannten Bereich ${areaId}`,
                    ),
                );
            }
        }
    }

    return { ok: issues.length === 0, issues };
}

export function assertCatalogValid(): void {
    const result = validateCatalog();
    if (!result.ok) {
        const lines = result.issues.map((i) => `[${i.code}] ${i.message}`).join('\n');
        throw new Error(`Catalog validation failed:\n${lines}`);
    }
}
