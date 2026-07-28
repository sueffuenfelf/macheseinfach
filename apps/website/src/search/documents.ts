import { areaOrder, areas, stories, tools } from '../data/catalog';
import type { AreaId, StoryId, ToolId } from '../data/catalog/types';
import { areaPath, storyPath, toolPath, toolShortcutPath } from '../routing/paths';
import { buildConversionVariants } from '../tools/_shared/image/variants';
import type { ToolVariant } from '../tools/types';
import { inferToolSlots } from './slots';
import type { DocumentSlots, SearchDocument } from './types';

function joinParts(parts: readonly (string | undefined)[]): string {
    return parts.filter(Boolean).join(' ');
}

function variantSlots(variant: ToolVariant): DocumentSlots {
    const from = variant.params.from ?? '';
    const to = variant.params.to ?? '';
    return {
        formats: [from, to].filter(Boolean),
        actions: ['convert'],
        context: from === 'heic' ? ['iphone', 'portal'] : ['bild'],
        multiStep: false,
    };
}

function buildToolDocument(toolId: ToolId, areaId: AreaId, storyId?: StoryId): SearchDocument {
    const tool = tools[toolId as keyof typeof tools];
    if (!tool) throw new Error(`Unknown tool: ${toolId}`);

    const story = storyId ? stories[storyId] : undefined;
    const slots = inferToolSlots(tool.id, tool.tags);

    return {
        id: storyId ? `tool:${tool.id}:${areaId}:${storyId}` : `tool:${tool.id}:${areaId}`,
        kind: 'tool',
        title: tool.shortTitle,
        subtitle: story?.outcome ?? tool.sub,
        body: joinParts([
            tool.title,
            tool.sub,
            tool.pain,
            tool.solution,
            story?.situation,
            story?.outcome,
            ...tool.tags,
            ...tool.keywords,
            tool.command,
        ]),
        keywords: [...tool.tags, ...tool.keywords, tool.command.replace('/', '')],
        slots,
        href: storyId ? toolPath(areaId, storyId, tool.id) : toolShortcutPath(tool.id),
        toolId: tool.id,
        areaId,
        storyId,
    };
}

function buildVariantDocument(variant: ToolVariant): SearchDocument {
    const areaId: AreaId = 'bilder';
    const storyId = 'story-bild-format-aendern' as StoryId;

    return {
        id: `variant:${variant.slug}`,
        kind: 'variant',
        title: variant.seo.h1,
        subtitle: variant.seo.description,
        body: joinParts([
            variant.seo.title,
            variant.seo.description,
            variant.seo.h1,
            ...variant.seo.keywords,
            variant.slug.replace(/-/g, ' '),
        ]),
        keywords: [...variant.seo.keywords, variant.slug],
        slots: variantSlots(variant),
        href: `/bereich/${areas[areaId].slug}/${variant.slug}/${variant.toolId}`,
        toolId: variant.toolId,
        areaId,
        storyId,
        variantSlug: variant.slug,
    };
}

function buildStoryDocument(storyId: StoryId): SearchDocument {
    const story = stories[storyId];
    const areaId = story.areaIds[0]!;
    const primaryToolId = story.toolIds[0];
    const slots: DocumentSlots = {
        formats: [],
        actions: [],
        context: [],
        multiStep: false,
    };

    for (const toolId of story.toolIds) {
        const tool = tools[toolId as keyof typeof tools];
        if (!tool) continue;
        const toolSlots = inferToolSlots(tool.id, tool.tags);
        slots.formats.push(...toolSlots.formats);
        slots.actions.push(...toolSlots.actions);
        slots.context.push(...toolSlots.context);
    }

    slots.formats = [...new Set(slots.formats)];
    slots.actions = [...new Set(slots.actions)];
    slots.context = [...new Set(slots.context)];

    return {
        id: `story:${story.id}`,
        kind: 'story',
        title: story.outcome,
        subtitle: story.situation,
        body: joinParts([story.title, story.role, story.want, story.situation, story.outcome]),
        keywords: [story.slug, story.role, story.want],
        slots,
        href: storyPath(areaId, story.id),
        areaId,
        storyId: story.id,
        toolId: primaryToolId,
    };
}

function buildAreaDocument(areaId: AreaId): SearchDocument {
    const area = areas[areaId];
    return {
        id: `area:${area.id}`,
        kind: 'area',
        title: area.label,
        subtitle: area.description,
        body: joinParts([area.label, area.shortLabel, area.description]),
        keywords: [area.slug, area.label],
        slots: {
            formats: areaId === 'bilder' ? ['heic', 'jpg', 'png'] : [],
            actions: [],
            context: areaId === 'bilder' ? ['bild'] : areaId === 'behoerden' ? ['behoerde'] : [],
            multiStep: areaId === 'bilder',
        },
        href: areaPath(areaId),
        areaId,
    };
}

let cachedDocuments: SearchDocument[] | null = null;

/** Baut den Suchindex aus Katalog, Varianten und Stories. */
export function buildSearchDocuments(): SearchDocument[] {
    if (cachedDocuments) return cachedDocuments;

    const docs: SearchDocument[] = [];
    const seen = new Set<string>();
    /** Tools already indexed via a story for a given area — avoid duplicate orphan docs */
    const toolsIndexedInArea = new Set<string>();

    function add(doc: SearchDocument) {
        if (seen.has(doc.id)) return;
        seen.add(doc.id);
        docs.push(doc);
    }

    for (const areaId of areaOrder) {
        add(buildAreaDocument(areaId));
        const area = areas[areaId];
        for (const storyId of area.storyIds) {
            const story = stories[storyId];
            if (story.status === 'planned' && (story.toolIds as readonly ToolId[]).length === 0)
                continue;
            add(buildStoryDocument(storyId));
            for (const toolId of story.toolIds) {
                const tool = tools[toolId as keyof typeof tools];
                if (!tool) continue;
                if (tool.areas.includes(areaId)) {
                    add(buildToolDocument(toolId, areaId, storyId));
                    toolsIndexedInArea.add(`${toolId}:${areaId}`);
                }
            }
        }
    }

    // Tools without (or outside) area stories — still searchable & linkable via /tool/:slug
    for (const tool of Object.values(tools)) {
        for (const areaId of tool.areas) {
            if (toolsIndexedInArea.has(`${tool.id}:${areaId}`)) continue;
            add(buildToolDocument(tool.id, areaId));
        }
    }

    for (const variant of buildConversionVariants()) {
        add(buildVariantDocument(variant));
    }

    cachedDocuments = docs;
    return docs;
}

export function getSearchDocumentById(id: string): SearchDocument | undefined {
    return buildSearchDocuments().find((doc) => doc.id === id);
}

export function embeddingTextForDocument(doc: SearchDocument): string {
    return [doc.title, doc.subtitle, doc.body, ...doc.keywords].join(' ').slice(0, 2000);
}

/** Test-Hilfe: Cache leeren */
export function resetSearchDocumentCache(): void {
    cachedDocuments = null;
}
