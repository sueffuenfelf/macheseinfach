import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRedirectTarget } from './paths';

/** Navigiert Legacy-URLs (z. B. `/tool/heic-convert`) auf kanonische Variant-Pfade. */
export function RouteRedirects() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const target = getRedirectTarget(location.pathname, location.search);
        if (!target) return;
        const current = `${location.pathname}${location.search}`;
        if (target === current || target === location.pathname) return;
        navigate(target, { replace: true });
    }, [location.pathname, location.search, navigate]);

    return null;
}
