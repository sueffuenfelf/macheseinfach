import { type AreaId, areaOrder, type ToolDefinition } from '../data/catalog';

/**
 * Public surface categories. Catalog may still list more ids while other
 * work lands; landing and sidenav only expose this set (intersected with
 * whatever still exists in `areaOrder`).
 */
export const LANDING_AREA_IDS = [
    'bilder',
    'einheiten',
    'web',
    'zeit',
    'text',
    'dokumente',
] as const satisfies readonly AreaId[];

const LANDING_AREA_SET = new Set<string>(LANDING_AREA_IDS);

export function visibleLandingAreaIds(): AreaId[] {
    const present = new Set<string>(areaOrder);
    return LANDING_AREA_IDS.filter((id) => present.has(id));
}

export function isLandingAreaId(id: AreaId): boolean {
    return LANDING_AREA_SET.has(id);
}

export function toolBelongsToLanding(tool: Pick<ToolDefinition, 'areas'>): boolean {
    return tool.areas.some((id) => LANDING_AREA_SET.has(id));
}
