import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { getTool } from '../data/catalog';
import { usePlatformNav } from '../routing/usePlatformNav';
import { favoritesPath, homePath, settingsPath, workspacePath } from '../routing/paths';
import { BrandLogo } from './BrandLogo';
import { AreaStep } from './AreaStep';
import { CommandPalette } from './CommandPalette';
import { FavoritesPage } from './FavoritesPage';
import { GlobalActionPalette, type GlobalAction } from './GlobalActionPalette';
import { SettingsPage } from './SettingsPage';
import { StoryPickStep, ToolPickForStory } from './StoryPickStep';
import { ToolWorkspace } from './ToolWorkspace';
import { WorkspaceDashboard } from './WorkspaceDashboard';
import { getToolWidget } from './widgets/registry';
import {
    addToolToWorkspaceStaging,
    addWidgetToWorkspaceStaging,
    createWorkspace,
    defaultWorkspace,
    deleteWorkspace,
    loadWorkspaceState,
    placeStagedWidget,
    removeStagedWidget,
    removeWidgetFromWorkspace,
    renameWorkspace,
    reorderWorkspaces,
    saveWorkspaceState,
    setDefaultWorkspace,
    setWorkspaceLayout,
    setWorkspaceSharedInput,
    setWorkspaceToolsMembership,
    setWidgetInputLinks,
    setWidgetPasswordOptions,
    setWidgetUseSharedInput,
    toggleWorkspaceTool,
    type Workspace,
    type WorkspaceState,
} from './workspaces/model';
import { useToast } from './toast';
import { useDismissLayer } from './useDismissLayer';

export function ToolShell() {
    const platform = usePlatformNav();
    const { settings } = useSettings();
    const { toast } = useToast();
    const [workspaceState, setWorkspaceState] = useState<WorkspaceState>(() => loadWorkspaceState());
    const [renameRequestId, setRenameRequestId] = useState(0);
    const [workspacePickerOpen, setWorkspacePickerOpen] = useState(false);
    const [pendingToolForWorkspace, setPendingToolForWorkspace] = useState<ReturnType<typeof getTool> | null>(null);
    const [layoutEditMode, setLayoutEditMode] = useState(false);
    const [workspaceImmersive, setWorkspaceImmersive] = useState(false);

    useDismissLayer(Boolean(workspacePickerOpen && pendingToolForWorkspace), () => {
        setWorkspacePickerOpen(false);
        setPendingToolForWorkspace(null);
    });

    const { page, activeAreaId, activeStoryId, activeTool, activeWorkspaceId } = platform;
    const workspaces = workspaceState.workspaces;

    useEffect(() => {
        document.documentElement.dataset.shell = 'brutalist';
        return () => {
            delete document.documentElement.dataset.shell;
        };
    }, []);

    useEffect(() => {
        saveWorkspaceState(workspaceState);
    }, [workspaceState]);

    useEffect(() => {
        if (!workspaceImmersive) return;
        document.body.classList.add('workspace-immersive');
        return () => document.body.classList.remove('workspace-immersive');
    }, [workspaceImmersive]);

    const activeWorkspace = useMemo(() => {
        if (page !== 'workspace') return null;
        const current = activeWorkspaceId ? workspaces.find((workspace) => workspace.slug === activeWorkspaceId) : null;
        return current ?? defaultWorkspace(workspaceState) ?? null;
    }, [activeWorkspaceId, page, workspaceState, workspaces]);

    useEffect(() => {
        if (page !== 'workspace') return;
        if (activeWorkspace) return;
        const fallback = defaultWorkspace(workspaceState);
        if (fallback) platform.goToWorkspace(fallback.slug);
    }, [activeWorkspace, page, platform, workspaceState]);

    useEffect(() => {
        if (page === 'workspace') return;
        setWorkspaceImmersive(false);
        if (document.fullscreenElement) {
            void document.exitFullscreen().catch(() => {
                // Ignore browsers that reject programmatic fullscreen exit.
            });
        }
    }, [page]);

    useEffect(() => {
        if (workspaceImmersive) platform.closePalette();
    }, [platform, workspaceImmersive]);

    const workspaceToolIds = useMemo(() => {
        if (!activeWorkspace) return [];
        const ids = new Set(activeWorkspace.toolIds);
        activeWorkspace.widgetIds.forEach((widgetId) => {
            const toolId = getToolWidget(widgetId)?.toolId;
            if (toolId) ids.add(toolId);
        });
        return [...ids];
    }, [activeWorkspace]);

    function updateState(nextState: WorkspaceState) {
        setWorkspaceState(nextState);
    }

    function createNewWorkspace(name?: string) {
        const created = createWorkspace(workspaceState, { name });
        updateState(created.state);
        platform.goToWorkspace(created.workspace.slug);
        toast({ message: `Arbeitsbereich „${created.workspace.name}" erstellt`, variant: 'success' });
    }

    function duplicateActiveWorkspace() {
        if (!activeWorkspace) return;
        const created = createWorkspace(workspaceState, { duplicateFromId: activeWorkspace.id });
        updateState(created.state);
        platform.goToWorkspace(created.workspace.slug);
        toast({ message: `„${created.workspace.name}" wurde dupliziert`, variant: 'success' });
    }

    function deleteActiveWorkspace() {
        if (!activeWorkspace) return;
        if (workspaces.length <= 1) {
            toast({ message: 'Mindestens ein Arbeitsbereich muss bestehen.', variant: 'error' });
            return;
        }
        const next = deleteWorkspace(workspaceState, activeWorkspace.id);
        updateState(next);
        const fallback = defaultWorkspace(next);
        if (fallback) platform.goToWorkspace(fallback.slug);
        toast({ message: `Arbeitsbereich „${activeWorkspace.name}" gelöscht`, variant: 'info' });
    }

    function renameActiveWorkspace(name: string) {
        if (!activeWorkspace) return;
        const next = renameWorkspace(workspaceState, activeWorkspace.id, name);
        updateState(next);
        const updated = next.workspaces.find((workspace) => workspace.id === activeWorkspace.id);
        if (updated && updated.slug !== activeWorkspace.slug) platform.goToWorkspace(updated.slug);
        toast({ message: 'Arbeitsbereich umbenannt', variant: 'success' });
    }

    function moveActiveWorkspace(direction: -1 | 1) {
        if (!activeWorkspace) return;
        const currentIndex = workspaces.findIndex((workspace) => workspace.id === activeWorkspace.id);
        updateState(reorderWorkspaces(workspaceState, currentIndex, currentIndex + direction));
    }

    function addToolToWorkspace(targetWorkspace: Workspace, tool = activeTool, baseState = workspaceState) {
        if (!tool) return;
        const result = addToolToWorkspaceStaging(baseState, targetWorkspace.id, tool.id);
        updateState(result.state);
        const workspace = result.state.workspaces.find((entry) => entry.id === targetWorkspace.id) ?? targetWorkspace;
        platform.goToWorkspace(workspace.slug);

        if (result.reason === 'added') {
            toast({
                message: `„${tool.shortTitle}" wurde zu „${workspace.name}" hinzugefügt — ziehe es auf das Dashboard`,
                variant: 'success',
            });
            return;
        }
        if (result.reason === 'already-placed') {
            toast({ message: `Widget ist bereits in „${workspace.name}" platziert`, variant: 'info' });
            return;
        }
        if (result.reason === 'already-staged') {
            toast({ message: `Widget wartet bereits in „${workspace.name}" auf Platzierung`, variant: 'info' });
            return;
        }
        if (result.reason === 'no-widget') {
            toast({ message: 'Für dieses Tool ist noch kein Widget verfügbar', variant: 'error' });
        }
    }

    function requestAddActiveToolToWorkspace() {
        if (!activeTool) return;
        if (workspaces.length === 1) {
            addToolToWorkspace(workspaces[0]!);
            return;
        }
        setPendingToolForWorkspace(activeTool);
        setWorkspacePickerOpen(true);
    }

    const globalActions = useMemo<GlobalAction[]>(() => {
        const switchActions = workspaces.map((workspace) => ({
            id: `switch-${workspace.slug}`,
            label: `Arbeitsbereich öffnen: ${workspace.name}`,
            hint: 'Switch',
            run: () => platform.goToWorkspace(workspace.slug),
        }));
        return [
            ...switchActions,
            { id: 'create-workspace', label: 'Neuer Arbeitsbereich', hint: 'Create', run: () => createNewWorkspace() },
            { id: 'duplicate-workspace', label: 'Aktiven Arbeitsbereich duplizieren', hint: 'Duplicate', run: duplicateActiveWorkspace },
            {
                id: 'rename-workspace',
                label: 'Aktiven Arbeitsbereich umbenennen',
                hint: 'Rename',
                run: () => setRenameRequestId((current) => current + 1),
            },
            {
                id: 'default-workspace',
                label: 'Als Standard setzen',
                hint: 'Default',
                run: () => {
                    if (!activeWorkspace) return;
                    updateState(setDefaultWorkspace(workspaceState, activeWorkspace.id));
                    toast({ message: `„${activeWorkspace.name}" ist jetzt Standard`, variant: 'success' });
                },
            },
            { id: 'delete-workspace', label: 'Aktiven Arbeitsbereich löschen', hint: 'Delete', run: deleteActiveWorkspace },
            { id: 'open-settings', label: 'Einstellungen öffnen', hint: 'Settings', run: platform.goToSettings },
            { id: 'open-favorites', label: 'Favoriten öffnen', hint: 'Favorites', run: platform.goToFavorites },
            { id: 'go-home', label: 'Startseite öffnen', hint: 'Home', run: platform.goHome },
        ];
    }, [activeWorkspace, platform, workspaceState, workspaces]);

    const paletteMode = page === 'workspace' ? 'workspace' : 'global';
    const defaultWorkspaceSlug = defaultWorkspace(workspaceState)?.slug;

    const mainContent =
        page === 'favorites' ? (
            <FavoritesPage />
        ) : page === 'settings' ? (
            <SettingsPage />
        ) : page === 'workspace' ? (
            activeWorkspace ? (
                <WorkspaceDashboard
                    workspace={activeWorkspace}
                    immersiveMode={workspaceImmersive}
                    onImmersiveModeChange={setWorkspaceImmersive}
                    layout={workspaceState.layouts[activeWorkspace.id] ?? {}}
                    layoutEditMode={layoutEditMode}
                    onLayoutChange={(nextLayout) => updateState(setWorkspaceLayout(workspaceState, activeWorkspace.id, nextLayout))}
                    onLayoutSaved={() => toast({ message: 'Dashboard-Layout gespeichert', variant: 'success' })}
                    onLayoutEditModeChange={(next) => {
                        setLayoutEditMode(next);
                        toast({
                            message: next ? 'Layout entsperrt: Ziehen und Skalieren aktiv' : 'Layout gesperrt: Widgets wieder bedienbar',
                            variant: next ? 'info' : 'success',
                        });
                    }}
                    onSharedInputChange={(value) => {
                        updateState(setWorkspaceSharedInput(workspaceState, activeWorkspace.id, value));
                    }}
                    onToggleWidgetUseSharedInput={(widgetId, useSharedInput) => {
                        updateState(setWidgetUseSharedInput(workspaceState, activeWorkspace.id, widgetId, useSharedInput));
                    }}
                    onWidgetPasswordOptionsChange={(widgetId, options) => {
                        updateState(setWidgetPasswordOptions(workspaceState, activeWorkspace.id, widgetId, options));
                    }}
                    advancedWidgetLinkingEnabled={settings.advancedWidgetLinking}
                    widgetLinks={activeWorkspace.widgetLinks}
                    onWidgetLinksChange={(widgetId, links) => {
                        updateState(setWidgetInputLinks(workspaceState, activeWorkspace.id, widgetId, links));
                    }}
                    onAddWidget={(widgetId) => {
                        const workspace = activeWorkspace;
                        if (workspace.widgetIds.includes(widgetId)) {
                            toast({ message: 'Widget ist bereits platziert', variant: 'info' });
                            return;
                        }
                        if (workspace.stagedWidgetIds.includes(widgetId)) {
                            toast({ message: 'Widget wartet bereits auf Platzierung', variant: 'info' });
                            return;
                        }
                        updateState(addWidgetToWorkspaceStaging(workspaceState, activeWorkspace.id, widgetId));
                        const widget = getToolWidget(widgetId);
                        toast({
                            message: widget
                                ? `„${widget.title}" wartet auf Platzierung — ziehe es auf das Dashboard`
                                : 'Widget wartet auf Platzierung',
                            variant: 'success',
                        });
                    }}
                    onRemoveWidget={(widgetId) => {
                        updateState(removeWidgetFromWorkspace(workspaceState, activeWorkspace.id, widgetId));
                        toast({ message: 'Widget entfernt', variant: 'info' });
                    }}
                    onRemoveStagedWidget={(widgetId) => {
                        updateState(removeStagedWidget(workspaceState, activeWorkspace.id, widgetId));
                        toast({ message: 'Widget aus Bereitstellung entfernt', variant: 'info' });
                    }}
                    onPlaceStagedWidget={(widgetId, position, breakpoint) => {
                        updateState(placeStagedWidget(workspaceState, activeWorkspace.id, widgetId, position, breakpoint));
                        toast({ message: 'Widget platziert', variant: 'success' });
                    }}
                    onToggleWorkspaceTool={(toolId) => {
                        updateState(toggleWorkspaceTool(workspaceState, activeWorkspace.id, toolId));
                        toast({ message: 'Tool-Set aktualisiert', variant: 'success' });
                    }}
                    onSetWorkspaceToolsMembership={(toolIds, enabled) => {
                        updateState(setWorkspaceToolsMembership(workspaceState, activeWorkspace.id, toolIds, enabled));
                        toast({ message: 'Tool-Set aktualisiert', variant: 'success' });
                    }}
                    onOpenTool={(toolId) => platform.selectTool(toolId)}
                    onOpenCatalog={platform.goHome}
                    onRenameWorkspace={renameActiveWorkspace}
                    renameRequestId={renameRequestId}
                />
            ) : null
        ) : !activeAreaId ? (
            <AreaStep />
        ) : page === 'tool' && activeTool ? (
            <ToolWorkspace tool={activeTool} onAddToWorkspace={requestAddActiveToolToWorkspace} />
        ) : page === 'story' && activeStoryId ? (
            <ToolPickForStory storyId={activeStoryId} />
        ) : activeAreaId ? (
            <StoryPickStep areaId={activeAreaId} />
        ) : (
            <AreaStep />
        );

    return (
        <div
            className={`flex min-h-screen flex-col bg-[var(--color-canvas)] text-[var(--color-ink)] ${
                workspaceImmersive ? 'workspace-shell--immersive' : ''
            }`}
            data-shell="brutalist"
        >
            {!workspaceImmersive ? (
            <header className="sticky top-0 z-30 border-b-2 border-black bg-white">
                <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-3 px-4 py-3 md:px-6">
                    <div className="flex items-center justify-between gap-3">
                    <Link to={homePath()} onClick={platform.goHome} className="ms-focus text-left" aria-label="Zur Startseite">
                        <BrandLogo />
                    </Link>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link to={favoritesPath()} className="ms-focus inline-flex h-10 items-center gap-1.5 rounded-[8px] border-2 border-black bg-white px-3 font-display text-[13px] font-semibold shadow-[2px_2px_0_#000] transition hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#000]">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 3.8l2.68 5.43 5.99.87-4.33 4.22 1.02 5.96L12 17.43l-5.36 2.83 1.02-5.96-4.33-4.22 5.99-.87z" />
                            </svg>
                            Favoriten
                        </Link>
                        {defaultWorkspaceSlug ? (
                            <Link
                                to={workspacePath(defaultWorkspaceSlug)}
                                onClick={() => platform.goToWorkspace(defaultWorkspaceSlug)}
                                aria-current={page === 'workspace' ? 'page' : undefined}
                                className={`ms-focus inline-flex h-10 items-center gap-1.5 rounded-[8px] border-2 border-black px-3 font-display text-[13px] font-semibold shadow-[2px_2px_0_#000] transition hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#000] ${
                                    page === 'workspace' ? 'bg-[var(--color-brand)] text-white' : 'bg-white'
                                }`}
                            >
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7" rx="1" />
                                    <rect x="14" y="3" width="7" height="7" rx="1" />
                                    <rect x="3" y="14" width="7" height="7" rx="1" />
                                    <rect x="14" y="14" width="7" height="7" rx="1" />
                                </svg>
                                Arbeitsbereiche
                            </Link>
                        ) : null}
                        <Link to={settingsPath()} className="ms-focus inline-flex h-10 w-10 items-center justify-center rounded-[8px] border-2 border-black bg-white shadow-[2px_2px_0_#000] transition hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#000]" aria-label="Einstellungen">
                            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                            </svg>
                        </Link>
                        <button type="button" onClick={platform.openPalette} className="ms-focus inline-flex items-center gap-2 rounded-[8px] border-2 border-black bg-white px-3 py-2 font-display text-[14px] font-semibold shadow-[2px_2px_0_#000] transition hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#000]">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <circle cx="11" cy="11" r="7" />
                                <path d="M20 20l-4-4" />
                            </svg>
                            {paletteMode === 'workspace' ? 'Tools suchen' : 'Aktionen'}
                            <span className="ms-kbd">⌘K</span>
                        </button>
                    </div>
                </div>
                </div>
                {page === 'workspace' && activeWorkspace ? (
                    <div className="mx-auto w-full max-w-[1040px] border-t-2 border-black px-4 py-2 md:px-6">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {workspaces.map((workspace) => (
                                <button
                                    key={workspace.id}
                                    type="button"
                                    onClick={() => platform.goToWorkspace(workspace.slug)}
                                    className={`ms-focus shrink-0 rounded-[8px] border-2 border-black px-3 py-1.5 font-display text-[12px] font-semibold ${
                                        workspace.id === activeWorkspace.id ? 'bg-[var(--color-brand)] text-white' : 'bg-white'
                                    }`}
                                >
                                    {workspace.name} {workspace.isDefault ? '•' : ''}
                                </button>
                            ))}
                            <button type="button" onClick={() => createNewWorkspace()} className="ms-focus shrink-0 rounded-[8px] border-2 border-black bg-white px-3 py-1.5 font-display text-[12px] font-semibold">
                                + Neu
                            </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <button type="button" onClick={duplicateActiveWorkspace} className="ms-focus shrink-0 rounded-[8px] border-2 border-black bg-white px-3 py-1.5 text-[11px] font-semibold">
                                Duplizieren
                            </button>
                            <button type="button" onClick={() => updateState(setDefaultWorkspace(workspaceState, activeWorkspace.id))} className="ms-focus shrink-0 rounded-[8px] border-2 border-black bg-white px-3 py-1.5 text-[11px] font-semibold">
                                Standard
                            </button>
                            <button type="button" onClick={() => moveActiveWorkspace(-1)} className="ms-focus shrink-0 rounded-[8px] border-2 border-black bg-white px-3 py-1.5 text-[11px] font-semibold" aria-label="Arbeitsbereich nach links verschieben">
                                ←
                            </button>
                            <button type="button" onClick={() => moveActiveWorkspace(1)} className="ms-focus shrink-0 rounded-[8px] border-2 border-black bg-white px-3 py-1.5 text-[11px] font-semibold" aria-label="Arbeitsbereich nach rechts verschieben">
                                →
                            </button>
                            <button type="button" onClick={deleteActiveWorkspace} className="ms-focus shrink-0 rounded-[8px] border-2 border-black bg-white px-3 py-1.5 text-[11px] font-semibold">
                                Löschen
                            </button>
                        </div>
                    </div>
                ) : null}
            </header>
            ) : null}

            {mainContent}

            {!workspaceImmersive ? (paletteMode === 'workspace' ? (
                <CommandPalette open={platform.paletteOpen} toolIds={workspaceToolIds} onClose={platform.closePalette} onSelectScenario={(tool) => platform.selectTool(tool.id)} />
            ) : (
                <GlobalActionPalette open={platform.paletteOpen} actions={globalActions} onClose={platform.closePalette} />
            )) : null}
            {workspacePickerOpen && pendingToolForWorkspace && !workspaceImmersive ? (
                <div className="fixed inset-0 z-50 flex items-end justify-center px-3 py-3 sm:items-center sm:px-4">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/35 backdrop-blur-[4px]"
                        onClick={() => {
                            setWorkspacePickerOpen(false);
                            setPendingToolForWorkspace(null);
                        }}
                        aria-label="Arbeitsbereich-Auswahl schließen"
                    />
                    <section className="ms-animate-pop relative z-10 max-h-[88svh] w-full max-w-[28rem] overflow-y-auto rounded-[16px] border-2 border-black bg-white p-4 shadow-brutal-lg">
                        <h2 className="font-display text-[18px] font-bold">Zu welchem Arbeitsbereich?</h2>
                        <p className="mt-1 text-[13px] text-[var(--color-ink-soft)]">
                            „{pendingToolForWorkspace.shortTitle}" wird als Widget bereitgestellt.
                        </p>
                        <ul className="mt-3 space-y-2">
                            {workspaces.map((workspace) => (
                                <li key={workspace.id}>
                                    <button
                                        type="button"
                                        className="ms-btn w-full justify-between px-3 py-2 text-[13px]"
                                        onClick={() => {
                                            addToolToWorkspace(workspace, pendingToolForWorkspace);
                                            setWorkspacePickerOpen(false);
                                            setPendingToolForWorkspace(null);
                                        }}
                                    >
                                        <span>{workspace.name}</span>
                                        {workspace.isDefault ? <span className="text-[11px] text-[var(--color-ink-soft)]">Standard</span> : null}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            className="ms-btn mt-3 w-full py-2 text-[12px]"
                            onClick={() => {
                                const created = createWorkspace(workspaceState);
                                addToolToWorkspace(created.workspace, pendingToolForWorkspace, created.state);
                                setWorkspacePickerOpen(false);
                                setPendingToolForWorkspace(null);
                            }}
                        >
                            Neuen Arbeitsbereich erstellen
                        </button>
                    </section>
                </div>
            ) : null}
            {!workspaceImmersive ? (
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
            ) : null}
        </div>
    );
}
