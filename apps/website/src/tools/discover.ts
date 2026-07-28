import type { ComponentType } from 'react';
import type { ToolDefinition, ToolId } from '../data/catalog/types';
import type { ToolModule } from './types';
import type { ToolShellRuntime } from './shell-runtime';
import { registerToolVariants } from './variant-registry';

const toolPages = new Map<ToolId, ComponentType<{ tool: ToolDefinition }>>();
const toolShells = new Map<ToolId, ToolShellRuntime>();
const discoveredIds: string[] = [];
const discoveredTools: Record<string, ToolDefinition> = {};

/**
 * Vite compile-time discovery — `import.meta.glob` is replaced statically at build/dev.
 * It is NOT a runtime API; never guard it with typeof checks (that always fails in the browser).
 * Under Bun test, glob throws at runtime — catch yields empty modules; validation is skipped.
 */
let modules: Record<string, { default: ToolModule }> = {};
try {
    Object.assign(
        modules,
        import.meta.glob<{ default: ToolModule }>('./*/config.ts', { eager: true }),
    );
} catch {
    // Bun test runner — import.meta.glob is unavailable
}

for (const [path, loaded] of Object.entries(modules)) {
    const match = /^\.\/([^/]+)\/config\.ts$/.exec(path);
    if (!match) continue;

    const folderId = match[1];
    const module = loaded?.default;
    if (!module) {
        throw new Error(`Tool config "${path}" has no default export.`);
    }

    const catalog = module.catalog;
    if (catalog.id !== folderId) {
        throw new Error(
            `Tool config id mismatch in "${path}": expected "${folderId}", got "${catalog.id}".`,
        );
    }

    discoveredIds.push(folderId);
    discoveredTools[folderId] = { ...catalog, id: folderId };
    if (module.page) {
        toolPages.set(folderId, module.page);
    }
    if (module.shell) {
        toolShells.set(folderId, module.shell);
    }

    if (module.variants) {
        registerToolVariants(module.variants());
    }
}

export type DiscoveryValidationResult = {
    ok: boolean;
    issues: string[];
};

/** Ensures Vite glob discovery produced tools — catches silent regressions early. */
export function validateDiscovery(): DiscoveryValidationResult {
    const issues: string[] = [];

    if (discoveredIds.length === 0) {
        issues.push(
            'Zero tools discovered. import.meta.glob must be processed by Vite (vite dev / vite build).',
        );
        return { ok: false, issues };
    }

    return { ok: issues.length === 0, issues };
}

export function assertDiscoveryValid(): void {
    const result = validateDiscovery();
    if (!result.ok) {
        throw new Error(
            `Tool discovery validation failed:\n${result.issues.map((i) => `  - ${i}`).join('\n')}`,
        );
    }
}

if (discoveredIds.length > 0) {
    assertDiscoveryValid();
}

export const discoveredToolIds = discoveredIds as readonly string[];
export const tools = discoveredTools as Record<ToolId, ToolDefinition>;

export function getToolPage(id: ToolId): ComponentType<{ tool: ToolDefinition }> | undefined {
    return toolPages.get(id);
}

export function getToolShellRuntime(id: ToolId): ToolShellRuntime | undefined {
    return toolShells.get(id);
}

export { getAllToolVariants, getVariantBySlug, getVariantsForTool } from './variant-registry';
