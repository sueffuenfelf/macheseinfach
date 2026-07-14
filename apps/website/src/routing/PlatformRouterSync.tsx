import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { getTool } from '../data/catalog';
import { usePlatform } from '../context/PlatformContext';
import { isTagFilterRoute, parsePathname, parseTagsParam } from './paths';

/** Hält PlatformContext mit der Browser-URL synchron (inkl. Zurück/Vor). */
export function PlatformRouterSync() {
    const location = useLocation();
    const { applyRoute, pushRecent } = usePlatform();

    useEffect(() => {
        const route = parsePathname(location.pathname, location.search);

        applyRoute({
            workspaceId: route.workspaceId,
            areaId: route.areaId,
            storyId: route.storyId,
            tool: route.toolId ? getTool(route.toolId) : null,
            tags: isTagFilterRoute(route.page) ? route.tags : [],
            page: route.page,
        });

        if (route.page === 'tool' && route.areaId && route.storyId && route.toolId) {
            pushRecent(route.toolId);
        }
    }, [location.pathname, location.search, applyRoute, pushRecent]);

    return null;
}

/** Schreibt Tag-Auswahl in die URL (replaceState) auf Situations-Seiten. */
export function TagUrlSync() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { page, activeTags } = usePlatform();

    useEffect(() => {
        if (!isTagFilterRoute(page)) return;

        const urlTags = parseTagsParam(searchParams.get('tags'));
        const sameLength = urlTags.length === activeTags.length;
        const sameTags = sameLength && urlTags.every((tag, i) => tag === activeTags[i]);
        if (sameTags) return;

        const next = new URLSearchParams(searchParams);
        if (activeTags.length === 0) {
            next.delete('tags');
        } else {
            next.set('tags', activeTags.join(','));
        }
        setSearchParams(next, { replace: true });
    }, [activeTags, page, searchParams, setSearchParams]);

    return null;
}
