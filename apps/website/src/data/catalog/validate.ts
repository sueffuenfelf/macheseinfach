import { areas } from './areas';
import { stories } from './stories';
import { catalogTags } from './tags';
import { tools } from './tools';
import type { AreaId, CatalogValidationIssue, CatalogValidationResult, StoryId, ToolId } from './types';

function issue(code: string, message: string): CatalogValidationIssue {
    return { code, message };
}

/** Laufzeit-Validierung — ergänzt TypeScript satisfies; in Tests & CI */
export function validateCatalog(): CatalogValidationResult {
    const issues: CatalogValidationIssue[] = [];

    const areaSlugs = new Set<string>();
    for (const area of Object.values(areas)) {
        if (areaSlugs.has(area.slug)) {
            issues.push(issue('DUPLICATE_AREA_SLUG', `Doppelter Bereichs-Slug „${area.slug}“`));
        }
        areaSlugs.add(area.slug);
    }

    const storySlugs = new Set<string>();
    for (const story of Object.values(stories)) {
        if (storySlugs.has(story.slug)) {
            issues.push(issue('DUPLICATE_STORY_SLUG', `Doppelter Story-Slug „${story.slug}“`));
        }
        storySlugs.add(story.slug);
    }

    const toolSlugs = new Set<string>();
    for (const tool of Object.values(tools)) {
        if (toolSlugs.has(tool.slug)) {
            issues.push(issue('DUPLICATE_TOOL_SLUG', `Doppelter Tool-Slug „${tool.slug}“`));
        }
        toolSlugs.add(tool.slug);
    }

    for (const area of Object.values(areas)) {
        for (const storyId of area.storyIds) {
            const story = stories[storyId as StoryId];
            if (!story) {
                issues.push(issue('AREA_UNKNOWN_STORY', `Area ${area.id} referenziert unbekannte Story ${storyId}`));
                continue;
            }
            if (!story.areaIds.includes(area.id)) {
                issues.push(
                    issue(
                        'AREA_STORY_MISMATCH',
                        `Story ${storyId} ist nicht in areaIds für Bereich ${area.id}`,
                    ),
                );
            }
        }
    }

    for (const story of Object.values(stories)) {
        for (const areaId of story.areaIds) {
            const area = areas[areaId as AreaId];
            if (!area) {
                issues.push(issue('STORY_UNKNOWN_AREA', `Story ${story.id} referenziert unbekannten Bereich ${areaId}`));
                continue;
            }
            if (!area.storyIds.includes(story.id)) {
                issues.push(
                    issue(
                        'STORY_AREA_MISSING',
                        `Bereich ${areaId} listet Story ${story.id} nicht in storyIds`,
                    ),
                );
            }
        }

        for (const toolId of story.toolIds) {
            const tool = tools[toolId as ToolId];
            if (!tool) {
                issues.push(issue('STORY_UNKNOWN_TOOL', `Story ${story.id} referenziert unbekanntes Tool ${toolId}`));
                continue;
            }
            if (!tool.storyIds.includes(story.id)) {
                issues.push(
                    issue('STORY_TOOL_MISMATCH', `Tool ${toolId} listet Story ${story.id} nicht in storyIds`),
                );
            }
        }
    }

    for (const tool of Object.values(tools)) {
        for (const tag of tool.tags) {
            if (!catalogTags[tag as keyof typeof catalogTags]) {
                issues.push(issue('TOOL_UNKNOWN_TAG', `Tool ${tool.id} nutzt unregistrierten Tag „${tag}“`));
            }
        }

        if (tool.areas.length === 0) {
            issues.push(issue('TOOL_NO_AREAS', `Tool ${tool.id} hat keine areas`));
        }

        for (const areaId of tool.areas) {
            if (!areas[areaId as AreaId]) {
                issues.push(issue('TOOL_UNKNOWN_AREA', `Tool ${tool.id} referenziert unbekannten Bereich ${areaId}`));
            }
        }

        for (const storyId of tool.storyIds) {
            const story = stories[storyId as StoryId];
            if (!story) {
                issues.push(issue('TOOL_UNKNOWN_STORY', `Tool ${tool.id} referenziert unbekannte Story ${storyId}`));
                continue;
            }
            if (!story.toolIds.includes(tool.id)) {
                issues.push(
                    issue('TOOL_STORY_MISMATCH', `Story ${storyId} listet Tool ${tool.id} nicht in toolIds`),
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
