import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { areaOrder, areas } from '../data/catalog';
import {
    areaPath,
    homePath,
    settingsPath,
    vorhabenPath,
} from '../routing/paths';
import { usePlatformNav } from '../routing/usePlatformNav';
import { BrandLogo } from './BrandLogo';
import { Icon } from './Icon';
import { SideNavAreaItem, SideNavItem } from './SideNavItem';
import { SideNavFavoritesSection } from './SideNavFavoritesSection';

function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
        </svg>
    );
}

function ListIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M4 6h16M4 12h10M4 18h16" />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </svg>
    );
}

function HomeIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M4 11l8-7 8 7" />
            <path d="M6 10v10h12V10" />
        </svg>
    );
}

type AppSideNavProps = {
    onNavigate?: () => void;
    className?: string;
};

export function AppSideNav({ onNavigate, className = '' }: AppSideNavProps) {
    const { page, activeAreaId, activeTool, openPalette, favorites, selectTool } = usePlatformNav();
    const location = useLocation();
    const isInBereichRoute = page === 'area' || page === 'story' || page === 'tool';
    const [areasOpen, setAreasOpen] = useState(isInBereichRoute);

    const dismiss = onNavigate;

    return (
        <nav
            className={`flex h-full min-h-0 flex-col bg-white ${className}`.trim()}
            aria-label="Hauptnavigation"
        >
            <div className="ms-shell-chrome box-border flex h-[var(--ms-shell-chrome-h)] min-h-[var(--ms-shell-chrome-h)] max-h-[var(--ms-shell-chrome-h)] shrink-0 items-center overflow-hidden border-b-2 border-black px-3">
                <Link
                    to={homePath()}
                    onClick={dismiss}
                    className="ms-sidenav-brand block select-none px-1"
                    aria-label="Zur Startseite"
                    draggable={false}
                >
                    <BrandLogo size={24} />
                </Link>
            </div>

            <div className="shrink-0 space-y-1 px-2 pt-2">
                <SideNavItem
                    to={homePath()}
                    onClick={dismiss}
                    active={page === 'home'}
                    icon={<HomeIcon />}
                    label="Start"
                />
                <SideNavItem
                    onClick={() => {
                        openPalette();
                        dismiss?.();
                    }}
                    active={page === 'search'}
                    icon={<SearchIcon />}
                    label="Suche"
                    trailing={<span className="ms-kbd hidden lg:inline-flex">⌘K</span>}
                />
                <SideNavItem
                    to={vorhabenPath()}
                    onClick={dismiss}
                    active={page === 'vorhaben'}
                    icon={<ListIcon />}
                    label="Vorhaben"
                />
            </div>

            <SideNavFavoritesSection
                favorites={favorites}
                activeToolId={activeTool?.id ?? null}
                onSelectTool={selectTool}
                onNavigate={dismiss}
            />

            <div className="mt-2 flex min-h-0 flex-1 flex-col px-2 pb-2">
                <button
                    type="button"
                    onClick={() => setAreasOpen((v) => !v)}
                    className="ms-focus ms-sidenav-btn flex w-full shrink-0 items-center justify-between px-2.5 py-1 font-display text-[11px] font-bold tracking-[0.05em] text-[var(--color-ink-muted)] uppercase"
                    aria-expanded={areasOpen}
                >
                    Bereiche
                    <svg
                        viewBox="0 0 24 24"
                        className={`h-3.5 w-3.5 transition ${areasOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        aria-hidden
                    >
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </button>
                {areasOpen ? (
                    <ul
                        className="mt-1 min-h-0 flex-1 space-y-1 overflow-y-auto px-1 pb-1"
                        role="list"
                    >
                        {areaOrder.map((id) => {
                            const area = areas[id];
                            const active =
                                activeAreaId === id ||
                                (page === 'area' && location.pathname === areaPath(id));
                            return (
                                <li key={id}>
                                    <SideNavAreaItem
                                        to={areaPath(id)}
                                        onClick={dismiss}
                                        active={active}
                                        accent={area.accent}
                                        icon={<Icon svg={area.icon} size={14} />}
                                        label={area.shortLabel}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                ) : null}
            </div>

            <div className="shrink-0 space-y-1 border-t-2 border-black px-2 py-2">
                <SideNavItem
                    to={settingsPath()}
                    onClick={dismiss}
                    active={page === 'settings'}
                    icon={<SettingsIcon />}
                    label="Einstellungen"
                />
                <p className="px-2.5 pt-1 text-[10px] leading-relaxed text-[var(--color-ink-muted)]">
                    Lokal · kein Konto · Open Source
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 px-2.5 text-[10px] text-[var(--color-ink-muted)]">
                    <span>Datenschutz</span>
                    <span>Quelltext</span>
                    <span>Impressum</span>
                </div>
            </div>
        </nav>
    );
}
