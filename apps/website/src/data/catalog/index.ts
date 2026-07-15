import { areaOrder, areas } from './areas';
import { stories } from './stories';
import { catalogTags, groupCatalogTags, TAG_GROUP_ORDER, type CatalogTagDefinition, type TagGroupId, type TagGroupSection } from './tags';
import { tools } from './tools';
import type {
    AreaDefinition,
    AreaId,
    ScenarioEntry,
    StoryId,
    ToolDefinition,
    ToolId,
    ToolMaturity,
    UserStory,
} from './types';
import { assertCatalogValid } from './validate';

export type {
    AreaDefinition,
    AreaId,
    ScenarioEntry,
    StoryId,
    ToolDefinition,
    ToolId,
    ToolMaturity,
    ToolTheme,
    UserStory,
};
export type Tool = ToolDefinition;
/** @deprecated Alias für Tool — schrittweise Migration */
export type Scenario = ToolDefinition;
export type ScenarioId = ToolId;

export { areaOrder, areas, stories, tools, assertCatalogValid };
export { catalogTags, groupCatalogTags, TAG_GROUP_ORDER };
export type { CatalogTagDefinition, TagGroupId, TagGroupSection };
export { validateCatalog } from './validate';

export function getArea(id: AreaId): AreaDefinition {
    return areas[id];
}

export function getStory(id: StoryId): UserStory {
    return stories[id];
}

export function getTool(id: ToolId): ToolDefinition {
    return tools[id];
}

export function getAreaBySlug(slug: string): AreaDefinition | undefined {
    return Object.values(areas).find((a) => a.slug === slug);
}

export function getStoryBySlug(slug: string): UserStory | undefined {
    return Object.values(stories).find((s) => s.slug === slug);
}

export function getToolBySlug(slug: string): ToolDefinition | undefined {
    return Object.values(tools).find((t) => t.slug === slug);
}

export function storiesInArea(areaId: AreaId): UserStory[] {
    return areas[areaId].storyIds.map((id) => stories[id]);
}

export function toolsInArea(areaId: AreaId): ToolDefinition[] {
    return Object.values(tools).filter((t) => t.areas.includes(areaId));
}

export function toolsForStory(storyId: StoryId): ToolDefinition[] {
    return stories[storyId].toolIds.map((id) => tools[id]);
}

/** Alle Tools als Liste — für Suche & ⌘K */
export const allTools = Object.values(tools);

export function findToolsForFile(name: string): ToolDefinition[] {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    return allTools.filter((t) => t.fileHints.includes(ext));
}

export function searchTools(query: string): ToolDefinition[] {
    const q = query.trim().toLowerCase();
    if (!q) return allTools;
    return allTools.filter(
        (t) =>
            t.title.toLowerCase().includes(q) ||
            t.shortTitle.toLowerCase().includes(q) ||
            t.sub.toLowerCase().includes(q) ||
            t.pain.toLowerCase().includes(q) ||
            t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
            t.keywords.some((k) => k.includes(q)) ||
            t.command.includes(q),
    );
}

export function entryLabel(entry: ScenarioEntry): string {
    switch (entry) {
        case 'file':
            return 'Datei';
        case 'form':
            return 'Eingabe';
        case 'file-or-form':
            return 'Datei oder Eingabe';
    }
}

export function maturityLabel(maturity: ToolMaturity): string {
    switch (maturity) {
        case 'stable':
            return 'Stabil';
        case 'beta':
            return 'Beta';
        case 'planned':
            return 'Geplant';
    }
}

export function areaAccent(areaId: AreaId): string {
    return areas[areaId].accent;
}

function collectTagsFromTools(toolList: readonly ToolDefinition[]): string[] {
    const set = new Set<string>();
    for (const tool of toolList) {
        for (const tag of tool.tags) set.add(tag);
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'de'));
}

/** Alle eindeutigen Tags aus dem Katalog — sortiert */
export function allCatalogTags(): string[] {
    return collectTagsFromTools(allTools);
}

/** Tags der Tools in einem Bereich */
export function tagsInArea(areaId: AreaId): string[] {
    return collectTagsFromTools(toolsInArea(areaId));
}

/** Tags der Tools einer Story */
export function tagsForStory(storyId: StoryId): string[] {
    return collectTagsFromTools(toolsForStory(storyId));
}

/**
 * Multi-Tag-Filter (AND): leere Auswahl = alles sichtbar;
 * sonst muss das Tool alle ausgewählten Tags tragen.
 */
export function toolMatchesTags(tool: ToolDefinition, activeTags: readonly string[]): boolean {
    if (activeTags.length === 0) return true;
    return activeTags.every((tag) => tool.tags.includes(tag));
}

export function storyMatchesTags(storyId: StoryId, activeTags: readonly string[]): boolean {
    if (activeTags.length === 0) return true;
    return toolsForStory(storyId).some((t) => toolMatchesTags(t, activeTags));
}

export function areaMatchesTags(areaId: AreaId, activeTags: readonly string[]): boolean {
    if (activeTags.length === 0) return true;
    return toolsInArea(areaId).some((t) => toolMatchesTags(t, activeTags));
}

/** @deprecated Verwende toolMatchesTags — Einzelauswahl-API */
export function toolMatchesTag(tool: ToolDefinition, tag: string | null): boolean {
    return toolMatchesTags(tool, tag ? [tag] : []);
}

/** Platzhalter für Suchfelder — Beispiele aus Katalog-Tags */
export function tagSearchPlaceholder(tags: readonly string[], maxExamples = 3): string {
    if (tags.length === 0) return 'Nach Tag filtern …';
    const sample = tags.slice(0, maxExamples).join(', ');
    return `Nach Tag filtern … z. B. ${sample}`;
}

/** @deprecated */
export const scenarios = allTools;
export const findScenariosForFile = findToolsForFile;
export const searchScenarios = searchTools;
