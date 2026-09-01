import { Link, useLocation } from 'react-router-dom';
import { areas } from '../data/catalog';
import { areaPath, homePath, settingsPath } from '../routing/paths';
import { usePlatformNav } from '../routing/usePlatformNav';
import { BrandLogo } from './BrandLogo';
import { Icon } from './Icon';
import { visibleLandingAreaIds } from './landing-areas';

function SearchIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden
        >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden
        >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </svg>
    );
}

export function AppMobileChrome() {
    const { page, activeAreaId, openPalette } = usePlatformNav();
    const location = useLocation();

    return (
        <div className="md:hidden" data-testid="app-mobile-chrome">
            <header className="ms-shell-chrome box-border flex h-[var(--ms-shell-chrome-h)] shrink-0 items-center justify-between gap-2 border-b-2 border-black bg-[var(--color-canvas)] px-3">
                <Link
                    to={homePath()}
                    className="ms-focus ms-sidenav-brand block select-none px-1"
                    aria-label="Zur Startseite"
                    draggable={false}
                >
                    <BrandLogo size={24} />
                </Link>
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        className="ms-focus inline-flex h-8 w-8 items-center justify-center rounded-[6px] border-2 border-black bg-white"
                        aria-label="Suche öffnen"
                        onClick={() => openPalette()}
                    >
                        <SearchIcon />
                    </button>
                    <Link
                        to={settingsPath()}
                        className="ms-focus inline-flex h-8 w-8 items-center justify-center rounded-[6px] border-2 border-black bg-white"
                        aria-label="Einstellungen"
                        aria-current={page === 'settings' ? 'page' : undefined}
                    >
                        <SettingsIcon />
                    </Link>
                </div>
            </header>
        </div>
    );
}

export function AppMobileAreaDock() {
    const { page, activeAreaId } = usePlatformNav();
    const location = useLocation();

    return (
        <nav
            className="ms-mobile-dock md:hidden"
            aria-label="Bereiche"
            data-testid="app-mobile-area-dock"
        >
            <ul className="grid grid-cols-6" role="list">
                {visibleLandingAreaIds().map((id) => {
                    const area = areas[id];
                    const active =
                        activeAreaId === id ||
                        (page === 'area' && location.pathname === areaPath(id));
                    return (
                        <li key={id} className="min-w-0">
                            <Link
                                to={areaPath(id)}
                                className="ms-focus ms-mobile-dock__stamp"
                                aria-current={active ? 'page' : undefined}
                                {...(active ? { 'data-active': true } : {})}
                            >
                                <span
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border-2 border-black"
                                    style={{ background: area.accent }}
                                >
                                    <Icon svg={area.icon} size={16} />
                                </span>
                                <span className="max-w-full truncate font-display text-[10px] font-bold leading-none">
                                    {area.shortLabel}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
