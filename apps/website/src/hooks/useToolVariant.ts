import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { ToolId } from '../data/catalog/types';
import { getVariantBySlug, parsePathname } from '../routing/paths';
import type { ToolVariant } from '../tools/types';

export function useToolVariant(toolId: ToolId): {
    variant: ToolVariant | null;
    params: Record<string, string>;
} {
    const location = useLocation();

    return useMemo(() => {
        const route = parsePathname(location.pathname, location.search);
        if (route.toolId !== toolId || !route.variantSlug) {
            return { variant: null, params: {} };
        }
        const variant = getVariantBySlug(route.variantSlug);
        if (!variant || variant.toolId !== toolId) {
            return { variant: null, params: {} };
        }
        return { variant, params: variant.params };
    }, [location.pathname, location.search, toolId]);
}
