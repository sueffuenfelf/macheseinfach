import { areaOrder, areas } from './areas';
import { stories } from './stories';
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

assertCatalogValid();

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

/** @deprecated */
export const scenarios = allTools;
export const findScenariosForFile = findToolsForFile;
export const searchScenarios = searchTools;
