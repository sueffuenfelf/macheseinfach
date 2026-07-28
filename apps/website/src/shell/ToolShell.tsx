import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePlatformNav } from '../routing/usePlatformNav';
import { favoritesPath, homePath, settingsPath } from '../routing/paths';
import { BrandLogo } from './BrandLogo';
import { AreaStep } from './AreaStep';
import { FavoritesPage } from './FavoritesPage';
import { GlobalActionPalette, type GlobalAction } from './GlobalActionPalette';
import { SettingsPage } from './SettingsPage';
import { SearchPage } from './SearchPage';
import { StoryPickStep, ToolPickForStory } from './StoryPickStep';
import { ConversionVariantHub } from './ConversionVariantHub';
import { isConversionHubStory } from '../routing/conversion-hub';
import { ToolWorkspace } from './ToolWorkspace';

export function ToolShell() {
    const platform = usePlatformNav();
    const { page, activeAreaId, activeStoryId, activeTool } = platform;

    useEffect(() => {
        document.documentElement.dataset.shell = 'brutalist';
        return () => {
            delete document.documentElement.dataset.shell;
        };
    }, []);

    const globalActions = useMemo<GlobalAction[]>(
        () => [
            {
                id: 'open-settings',
                label: 'Einstellungen öffnen',
                hint: 'Settings',
                run: platform.goToSettings,
            },
            {
                id: 'open-favorites',
                label: 'Favoriten öffnen',
                hint: 'Favorites',
                run: platform.goToFavorites,
            },
            { id: 'go-home', label: 'Startseite öffnen', hint: 'Home', run: platform.goHome },
        ],
        [platform],
    );

    const mainContent =
        page === 'favorites' ? (
            <FavoritesPage />
        ) : page === 'settings' ? (
            <SettingsPage />
        ) : page === 'search' ? (
            <SearchPage />
        ) : !activeAreaId ? (
            <AreaStep />
        ) : page === 'tool' && activeTool ? (
            <ToolWorkspace tool={activeTool} />
        ) : page === 'story' && activeStoryId ? (
            isConversionHubStory(activeStoryId) ? (
                <ConversionVariantHub />
            ) : (
                <ToolPickForStory storyId={activeStoryId} />
            )
        ) : activeAreaId ? (
            <StoryPickStep areaId={activeAreaId} />
        ) : (
            <AreaStep />
        );

    return (
        <div
            className="flex min-h-screen flex-col bg-[var(--color-canvas)] text-[var(--color-ink)]"
            data-shell="brutalist"
        >
            <header className="sticky top-0 z-30 border-b-2 border-black bg-white">
                <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-3 px-4 py-3 md:px-6">
                    <div className="flex items-center justify-between gap-3">
                        <Link
                            to={homePath()}
                            onClick={platform.goHome}
                            className="ms-focus text-left"
                            aria-label="Zur Startseite"
                        >
                            <BrandLogo />
                        </Link>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <Link
                                to={favoritesPath()}
                                className="ms-focus inline-flex h-10 items-center gap-1.5 rounded-[8px] border-2 border-black bg-white px-3 font-display text-[13px] font-semibold shadow-[2px_2px_0_#000] transition hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#000]"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M12 3.8l2.68 5.43 5.99.87-4.33 4.22 1.02 5.96L12 17.43l-5.36 2.83 1.02-5.96-4.33-4.22 5.99-.87z" />
                                </svg>
                                Favoriten
                            </Link>
                            <Link
                                to={settingsPath()}
                                className="ms-focus inline-flex h-10 w-10 items-center justify-center rounded-[8px] border-2 border-black bg-white shadow-[2px_2px_0_#000] transition hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#000]"
                                aria-label="Einstellungen"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-4.5 w-4.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                                </svg>
                            </Link>
                            <button
                                type="button"
                                onClick={platform.openPalette}
                                className="ms-focus inline-flex items-center gap-2 rounded-[8px] border-2 border-black bg-white px-3 py-2 font-display text-[14px] font-semibold shadow-[2px_2px_0_#000] transition hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#000]"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="M20 20l-4-4" />
                                </svg>
                                Aktionen
                                <span className="ms-kbd">⌘K</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {mainContent}

            <GlobalActionPalette
                open={platform.paletteOpen}
                actions={globalActions}
                onClose={platform.closePalette}
            />

            <footer className="mt-auto border-t-2 border-black bg-white px-4 py-4 text-center md:px-6">
                <p className="text-[12px] text-[var(--color-ink-soft)]">
                    Dateien bleiben auf deinem Gerät · keine Registrierung · Open Source
                </p>
                <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-[var(--color-ink-muted)]">
                    <Link
                        to={favoritesPath()}
                        className="ms-focus underline decoration-[var(--color-line)] underline-offset-2 hover:text-[var(--color-ink)]"
                    >
                        Favoriten
                    </Link>
                    <Link
                        to={settingsPath()}
                        className="ms-focus underline decoration-[var(--color-line)] underline-offset-2 hover:text-[var(--color-ink)]"
                    >
                        Einstellungen
                    </Link>
                    <span>Datenschutz</span>
                    <span>Quelltext</span>
                    <span>Impressum</span>
                </div>
            </footer>
        </div>
    );
}
