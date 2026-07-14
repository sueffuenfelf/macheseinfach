import { useEffect } from 'react';
import { toolsForStory } from '../data/catalog';
import { usePlatform } from '../context/PlatformContext';
import { AreaStep } from './AreaStep';
import { Breadcrumb } from './Breadcrumb';
import { CommandPalette } from './CommandPalette';
import { StoryPickStep, ToolPickForStory } from './StoryPickStep';
import { ToolWorkspace } from './ToolWorkspace';
import { TrustBadge } from './components/Primitives';

export function ToolShell() {
    const platform = usePlatform();

    useEffect(() => {
        document.documentElement.dataset.shell = 'brutalist';
        return () => {
            delete document.documentElement.dataset.shell;
        };
    }, []);

    const { activeAreaId, activeStoryId, activeTool } = platform;
    const needsToolPick = Boolean(activeStoryId && !activeTool && toolsForStory(activeStoryId).length > 1);

    return (
        <div className="flex min-h-screen flex-col bg-[var(--color-canvas)] text-[var(--color-ink)]" data-shell="brutalist">
            <header className="sticky top-0 z-30 border-b-2 border-black bg-white">
                <div className="mx-auto flex w-full max-w-[1040px] items-center justify-between gap-4 px-4 py-3 md:px-6">
                    <button
                        type="button"
                        onClick={platform.goHome}
                        className="ms-focus inline-flex items-center gap-2 text-left"
                        aria-label="Zur Startseite"
                    >
                        <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[7px] border-2 border-black bg-[#ff90e8] font-display text-[16px] font-bold text-white shadow-[2px_2px_0_#000]">
                            m
                        </span>
                        <span className="font-display text-[19px] font-bold tracking-[-0.02em] text-[var(--color-ink)]">
                            macheseinfa<span className="text-[var(--color-brand)]">.ch</span>
                        </span>
                    </button>
                    <div className="flex items-center gap-2">
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
                            Tools finden
                            <span className="ms-kbd">⌘K</span>
                        </button>
                        <div className="hidden sm:block">
                            <TrustBadge />
                        </div>
                    </div>
                </div>
            </header>

            <Breadcrumb />

            {!activeAreaId ? (
                <AreaStep />
            ) : activeTool ? (
                <ToolWorkspace tool={activeTool} />
            ) : needsToolPick ? (
                <ToolPickForStory storyId={activeStoryId!} />
            ) : (
                <StoryPickStep areaId={activeAreaId} />
            )}

            <CommandPalette
                open={platform.paletteOpen}
                onClose={platform.closePalette}
                onSelectScenario={(tool) => platform.selectTool(tool.id)}
            />
            <footer className="mt-auto border-t-2 border-black bg-white px-4 py-4 text-center md:px-6">
                <p className="text-[12px] text-[var(--color-ink-soft)]">
                    Dateien bleiben auf deinem Gerät · keine Registrierung · Open Source
                </p>
                <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-[var(--color-ink-muted)]">
                    <span>Datenschutz</span>
                    <span>Quelltext</span>
                    <span>Impressum</span>
                </div>
            </footer>
        </div>
    );
}
