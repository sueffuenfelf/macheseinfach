const DEFAULT_SITE_URL = 'https://macheseinfa.ch';

function readEnv(key: string): string | undefined {
    if (typeof process !== 'undefined' && process.env[key] !== undefined) {
        return process.env[key];
    }
    if (typeof import.meta !== 'undefined' && import.meta.env?.[key] !== undefined) {
        return import.meta.env[key] as string;
    }
    return undefined;
}

/** Canonical site URL — override via `VITE_SITE_URL` at build time. */
export const SITE_URL = readEnv('VITE_SITE_URL')?.replace(/\/$/, '') ?? DEFAULT_SITE_URL;

export const SITE_NAME = 'macheseinfa.ch';

export const DEFAULT_DESCRIPTION =
    'Datenschutzfreundliche Alltags-Tools für Deutschland — 100 % im Browser, ohne Registrierung, ohne Server-Upload.';

export const PRIVACY_PATH = '/datenschutz';
export const IMPRINT_PATH = '/impressum';

/**
 * Indexing is on unless explicitly disabled (`true` / `1`).
 * Honor both `FF_DISALLOW_INDEXING` (build) and `VITE_FF_DISALLOW_INDEXING` (client).
 */
export function isIndexingDisallowed(): boolean {
    const raw = readEnv('FF_DISALLOW_INDEXING') ?? readEnv('VITE_FF_DISALLOW_INDEXING');
    return raw === 'true' || raw === '1';
}

export function robotsDirectiveForRoute(routeNoindex?: boolean): string {
    if (isIndexingDisallowed() || routeNoindex) return 'noindex, nofollow';
    return 'index, follow';
}

export function isRouteIndexable(routeNoindex?: boolean): boolean {
    if (isIndexingDisallowed()) return false;
    return !routeNoindex;
}
