/** Canonical site URL for SEO — override via VITE_SITE_URL at build time. */
const envUrl =
    typeof import.meta !== 'undefined'
        ? (import.meta.env?.VITE_SITE_URL as string | undefined)
        : undefined;

export const SITE_URL = envUrl?.replace(/\/$/, '') ?? 'https://macheseinfa.ch';

export const SITE_NAME = 'macheseinfa.ch';

export const DEFAULT_DESCRIPTION =
    'Datenschutzfreundliche Alltags-Tools für Deutschland — 100 % im Browser, ohne Registrierung, ohne Server-Upload.';
