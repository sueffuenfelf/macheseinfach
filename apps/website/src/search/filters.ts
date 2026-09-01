import { areas, getAreaBySlug, type AreaId } from '../data/catalog';
import type { SearchDocumentKind } from './types';

export type ParsedSearchFilters = {
    /** Remaining free-text query after @ tokens are removed */
    textQuery: string;
    /** null = all document kinds */
    kinds: ReadonlySet<SearchDocumentKind> | null;
    areaId: AreaId | null;
};

const KIND_ALIASES: Record<string, SearchDocumentKind[]> = {
    tools: ['tool', 'variant'],
    tool: ['tool'],
    varianten: ['variant'],
    variant: ['variant'],
    bereiche: ['area'],
    bereich: ['area'],
    areas: ['area'],
    area: ['area'],
};

function normalizeFilterToken(token: string): string {
    return token
        .slice(1)
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss');
}

function resolveAreaFilter(token: string): AreaId | null {
    const raw = normalizeFilterToken(token);
    const bySlug = getAreaBySlug(raw);
    if (bySlug) return bySlug.id;
    if (raw in areas) return raw as AreaId;
    return null;
}

function resolveKindFilter(token: string): SearchDocumentKind[] | null {
    const raw = normalizeFilterToken(token);
    return KIND_ALIASES[raw] ?? null;
}

/**
 * Parse `@type` and `@area` tokens from a search query.
 *
 * Examples:
 * - `@tools png verkleinern` → tools/variants matching "png verkleinern"
 * - `@tools @bilder` → all tools in bilder
 * - `@tools json` → tools matching "json"
 */
export function parseSearchFilters(raw: string): ParsedSearchFilters {
    const tokens = raw.trim().split(/\s+/).filter(Boolean);
    const textParts: string[] = [];
    const kindSet = new Set<SearchDocumentKind>();
    let areaId: AreaId | null = null;
    let hasKindFilter = false;

    for (const token of tokens) {
        if (!token.startsWith('@')) {
            textParts.push(token);
            continue;
        }

        const area = resolveAreaFilter(token);
        if (area) {
            areaId = area;
            continue;
        }

        const kinds = resolveKindFilter(token);
        if (kinds) {
            hasKindFilter = true;
            for (const kind of kinds) kindSet.add(kind);
            continue;
        }

        // Unknown @token — treat as plain text so users aren't surprised
        textParts.push(token);
    }

    return {
        textQuery: textParts.join(' ').trim(),
        kinds: hasKindFilter ? kindSet : null,
        areaId,
    };
}

export function documentMatchesFilters(
    doc: {
        kind: SearchDocumentKind;
        areaId?: AreaId;
    },
    filters: ParsedSearchFilters,
): boolean {
    if (filters.kinds && !filters.kinds.has(doc.kind)) return false;
    if (filters.areaId) {
        if (doc.kind === 'area' && doc.areaId !== filters.areaId) return false;
        if (doc.kind !== 'area' && doc.areaId !== filters.areaId) return false;
    }
    return true;
}

export function filterHint(): string {
    return '@tools · @bereiche · @<bereich-slug>';
}
