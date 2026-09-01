import { areaOrder, areas, tools } from '../data/catalog';
import type { AreaId, ToolId } from '../data/catalog/types';
import { areaPath, toolShortcutPath } from '../routing/paths';
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

function buildToolDocument(toolId: ToolId, areaId: AreaId): SearchDocument {
    const tool = tools[toolId as keyof typeof tools];
    if (!tool) throw new Error(`Unknown tool: ${toolId}`);

    const slots = inferToolSlots(tool.id, tool.tags);

    return {
        id: `tool:${tool.id}:${areaId}`,
        kind: 'tool',
        title: tool.shortTitle,
        subtitle: tool.sub,
        body: joinParts([
            tool.title,
            tool.sub,
            tool.pain,
            tool.solution,
            ...tool.tags,
            ...tool.keywords,
            tool.command,
        ]),
        keywords: [...tool.tags, ...tool.keywords, tool.command.replace('/', '')],
        slots,
        href: toolShortcutPath(tool.id),
        toolId: tool.id,
        areaId,
    };
}

function buildVariantDocument(variant: ToolVariant): SearchDocument {
    const areaId: AreaId = 'bilder';

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
        variantSlug: variant.slug,
    };
}

function buildAreaDocument(areaId: AreaId): SearchDocument {
    const area = areas[areaId];
    return {
        id: `area:${area.id}`,
        title: area.label,
        kind: 'area',
        subtitle: area.description,
        body: joinParts([area.label, area.shortLabel, area.description]),
        keywords: [area.slug, area.label],
        slots: {
            formats: areaId === 'bilder' ? ['heic', 'jpg', 'png'] : [],
            actions: [],
            context: areaId === 'bilder' ? ['bild'] : [],
            multiStep: false,
        },
        href: areaPath(areaId),
        areaId,
    };
}

let cachedDocuments: SearchDocument[] | null = null;

/** Baut den Suchindex aus Katalog und Varianten. */
export function buildSearchDocuments(): SearchDocument[] {
    if (cachedDocuments) return cachedDocuments;

    const docs: SearchDocument[] = [];
    const seen = new Set<string>();

    function add(doc: SearchDocument) {
        if (seen.has(doc.id)) return;
        seen.add(doc.id);
        docs.push(doc);
    }

    for (const areaId of areaOrder) {
        add(buildAreaDocument(areaId));
    }

    for (const tool of Object.values(tools)) {
        for (const areaId of tool.areas) {
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
