import { getTool, type ToolId } from '../data/catalog';
import type { ScoredResult } from '../search';

export type PaletteSearchSelection =
    | { kind: 'tool'; toolId: ToolId }
    | { kind: 'href'; href: string };

/** Resolve CMD+K search hit to tool navigation or fallback href. */
export function resolvePaletteSearchSelection(entry: ScoredResult): PaletteSearchSelection {
    const toolId = entry.document.toolId;
    if (toolId && getTool(toolId)) {
        return { kind: 'tool', toolId };
    }
    return { kind: 'href', href: entry.document.href };
}
