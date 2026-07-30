import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { parsePathname } from '../routing/paths';
import { PageHead } from './PageHead';
import { resolveRouteMeta } from './route-meta';
import { SITE_URL } from './site-config';

/** Keeps document head in sync with the current platform route (client navigation). */
export function RouteHead() {
    const location = useLocation();

    const meta = useMemo(
        () => resolveRouteMeta(parsePathname(location.pathname, location.search), SITE_URL),
        [location.pathname, location.search],
    );

    return <PageHead meta={meta} />;
}
