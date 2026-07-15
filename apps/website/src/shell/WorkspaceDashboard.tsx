import { useEffect, useLayoutEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { allTools, getTool, searchTools, type ToolId } from '../data/catalog';
import { getToolWidget, listToolWidgets } from './widgets/registry';
import type { WidgetValuePort } from './widgets/types';
import { SettingsToggleRow } from './widgets/SettingsToggleRow';
import { WidgetSettingsPopover } from './widgets/WidgetSettingsPopover';
import {
    resolvePasswordOptions,
    resolveUseSharedInput,
    type Workspace,
    type WorkspaceLayoutItem,
    type WorkspaceLayoutSet,
    type WorkspaceWidgetLink,
    type WorkspaceWidgetLinkInput,
    type WidgetPasswordOptions,
} from './workspaces/model';
import { useDragAutoScroll } from './useDragAutoScroll';
import { useDismissLayer } from './useDismissLayer';
import { useFullscreenTarget } from './useFullscreen';
import { WorkspaceTitleEditor } from './WorkspaceTitleEditor';
import GridLayout, { useContainerWidth } from 'react-grid-layout';

const STAGED_WIDGET_DRAG_MIME = 'application/x-macheseinfach-widget-id';

type WorkspaceDashboardProps = {
    workspace: Workspace;
    layout: WorkspaceLayoutSet;
    layoutEditMode: boolean;
    onLayoutChange: (next: WorkspaceLayoutSet) => void;
    onLayoutSaved?: () => void;
    onLayoutEditModeChange: (next: boolean) => void;
    onSharedInputChange: (value: string) => void;
    onToggleWidgetUseSharedInput: (widgetId: string, useSharedInput: boolean) => void;
    onWidgetPasswordOptionsChange: (widgetId: string, options: WidgetPasswordOptions) => void;
    advancedWidgetLinkingEnabled: boolean;
    widgetLinks: WorkspaceWidgetLink[];
    onWidgetLinksChange: (widgetId: string, links: WorkspaceWidgetLinkInput[]) => void;
    onAddWidget: (widgetId: string) => void;
    onRemoveWidget: (widgetId: string) => void;
    onRemoveStagedWidget: (widgetId: string) => void;
    onPlaceStagedWidget: (
        widgetId: string,
        position: Pick<WorkspaceLayoutItem, 'x' | 'y' | 'w' | 'h'>,
        breakpoint: keyof WorkspaceLayoutSet,
    ) => void;
    onToggleWorkspaceTool: (toolId: ToolId) => void;
    onSetWorkspaceToolsMembership: (toolIds: readonly ToolId[], enabled: boolean) => void;
    onOpenTool: (toolId: ReturnType<typeof getTool>['id']) => void;
    onOpenCatalog: () => void;
    onRenameWorkspace: (name: string) => void;
    renameRequestId?: number;
};

export function WorkspaceDashboard({
    workspace,
    layout,
    layoutEditMode,
    onLayoutChange,
    onLayoutSaved,
    onLayoutEditModeChange,
    onSharedInputChange,
    onToggleWidgetUseSharedInput,
    onWidgetPasswordOptionsChange,
    advancedWidgetLinkingEnabled,
    widgetLinks,
    onWidgetLinksChange,
    onAddWidget,
    onRemoveWidget,
    onRemoveStagedWidget,
    onPlaceStagedWidget,
    onToggleWorkspaceTool,
    onSetWorkspaceToolsMembership,
    onOpenTool,
    onOpenCatalog,
    onRenameWorkspace,
    renameRequestId,
}: WorkspaceDashboardProps) {
    const rootRef = useRef<HTMLElement>(null);
    const pickerSearchRef = useRef<HTMLInputElement>(null);
    const { isFullscreen, toggleFullscreen, exitFullscreen } = useFullscreenTarget(rootRef);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerMode, setPickerMode] = useState<'widgets' | 'tools'>('widgets');
    const [query, setQuery] = useState('');
    const [stagingOpen, setStagingOpen] = useState(true);
    const [draggingStagedWidgetId, setDraggingStagedWidgetId] = useState<string | null>(null);
    const [gridInteracting, setGridInteracting] = useState(false);
    const [openSettingsWidgetId, setOpenSettingsWidgetId] = useState<string | null>(null);
    const [linkValues, setLinkValues] = useState<Record<string, Partial<Record<WidgetValuePort, string>>>>({});
    const { width: gridWidth, containerRef: gridContainerRef, mounted: gridMounted } = useContainerWidth({
        initialWidth: 1168,
    });
    const { beginDragAutoScroll, endDragAutoScroll, trackDragPointer } = useDragAutoScroll();

    useDismissLayer(pickerOpen, () => setPickerOpen(false));

    useLayoutEffect(() => {
        if (!pickerOpen) return;
        const frame = requestAnimationFrame(() => {
            pickerSearchRef.current?.focus({ preventScroll: true });
        });
        return () => cancelAnimationFrame(frame);
    }, [pickerOpen]);

    useEffect(() => {
        if (!draggingStagedWidgetId) return;
        const onDragOver = (event: globalThis.DragEvent) => {
            trackDragPointer(event.clientY);
        };
        window.addEventListener('dragover', onDragOver);
        return () => window.removeEventListener('dragover', onDragOver);
    }, [draggingStagedWidgetId, trackDragPointer]);

    useEffect(() => {
        if (layoutEditMode) return;
        setDraggingStagedWidgetId(null);
        setGridInteracting(false);
        endDragAutoScroll();
    }, [endDragAutoScroll, layoutEditMode]);

    useEffect(() => {
        const active = gridInteracting || Boolean(draggingStagedWidgetId);
        if (!active) return;
        document.body.classList.add('workspace-grid-interacting');
        return () => document.body.classList.remove('workspace-grid-interacting');
    }, [draggingStagedWidgetId, gridInteracting]);

    useEffect(() => {
        setOpenSettingsWidgetId(null);
        setLinkValues({});
    }, [workspace.id]);

    useEffect(() => {
        void exitFullscreen();
    }, [workspace.id, exitFullscreen]);

    const currentBreakpoint = gridWidth >= 1200 ? 'lg' : gridWidth >= 996 ? 'md' : gridWidth >= 768 ? 'sm' : gridWidth >= 480 ? 'xs' : 'xxs';
    const cols = currentBreakpoint === 'lg' ? 12 : currentBreakpoint === 'md' ? 10 : currentBreakpoint === 'sm' ? 6 : currentBreakpoint === 'xs' ? 4 : 2;
    const currentLayout = layout[currentBreakpoint] ?? layout.lg ?? [];
    const layoutConfigByWidgetId = useMemo(() => {
        const source = layout.lg ?? currentLayout;
        return new Map(source.map((item) => [item.i, item]));
    }, [currentLayout, layout.lg]);

    const stagedWidgets = useMemo(
        () => workspace.stagedWidgetIds.map((widgetId) => getToolWidget(widgetId)).filter((widget) => Boolean(widget)),
        [workspace.stagedWidgetIds],
    );

    const widgets = useMemo(
        () => workspace.widgetIds.map((widgetId) => getToolWidget(widgetId)).filter((widget) => Boolean(widget)),
        [workspace.widgetIds],
    );
    const linkSourceWidgets = useMemo(
        () =>
            widgets
                .filter((widget) => Array.isArray(widget.outputPorts) && widget.outputPorts.length > 0)
                .map((widget) => ({
                    id: widget.id,
                    title: widget.title,
                    ports: widget.outputPorts ?? [],
                })),
        [widgets],
    );
    const linksByTarget = useMemo(() => {
        const map = new Map<string, WorkspaceWidgetLinkInput[]>();
        for (const link of widgetLinks) {
            const bucket = map.get(link.targetWidgetId) ?? [];
            bucket.push({ sourceWidgetId: link.sourceWidgetId, sourcePort: link.sourcePort });
            map.set(link.targetWidgetId, bucket);
        }
        return map;
    }, [widgetLinks]);
    const linkedInputByWidget = useMemo(() => {
        const values = new Map<string, { value: string; label: string }>();
        if (!advancedWidgetLinkingEnabled) return values;
        for (const widget of widgets) {
            const links = linksByTarget.get(widget.id) ?? [];
            if (links.length === 0) continue;
            const parts: string[] = [];
            const labels: string[] = [];
            for (const link of links) {
                const sourceWidget = getToolWidget(link.sourceWidgetId);
                const sourceValue = linkValues[link.sourceWidgetId]?.[link.sourcePort];
                if (!sourceWidget || !sourceValue?.trim()) continue;
                parts.push(sourceValue.trim());
                const portLabel =
                    sourceWidget.outputPorts?.find((entry) => entry.id === link.sourcePort)?.label ?? link.sourcePort;
                labels.push(`${sourceWidget.title} · ${portLabel}`);
            }
            if (parts.length === 0) continue;
            values.set(widget.id, {
                value: parts.join('\n'),
                label: labels.join(', '),
            });
        }
        return values;
    }, [advancedWidgetLinkingEnabled, linkValues, linksByTarget, widgets]);
    const availableWidgets = useMemo(
        () =>
            listToolWidgets().filter(
                (widget) => !workspace.widgetIds.includes(widget.id) && !workspace.stagedWidgetIds.includes(widget.id),
            ),
        [workspace.stagedWidgetIds, workspace.widgetIds],
    );

    const filteredWidgets = useMemo(() => {
        if (!query.trim()) return availableWidgets;
        const normalized = query.toLowerCase();
        return availableWidgets.filter((widget) => {
            const tool = getTool(widget.toolId);
            return (
                widget.title.toLowerCase().includes(normalized) ||
                widget.description.toLowerCase().includes(normalized) ||
                widget.tags.some((tag) => tag.toLowerCase().includes(normalized)) ||
                tool.shortTitle.toLowerCase().includes(normalized)
            );
        });
    }, [availableWidgets, query]);

    const filteredTools = useMemo(() => {
        if (!query.trim()) return allTools;
        return searchTools(query);
    }, [query]);

    const allFilteredToolsEnabled = useMemo(
        () => filteredTools.length > 0 && filteredTools.every((tool) => workspace.toolIds.includes(tool.id)),
        [filteredTools, workspace.toolIds],
    );

    const suggestedWidgets = useMemo(
        () => listToolWidgets().filter((widget) => ['widget-iban-quick', 'widget-girocode-quick', 'widget-leak-check'].includes(widget.id)),
        [],
    );

    const draggingStagedWidget = draggingStagedWidgetId ? getToolWidget(draggingStagedWidgetId) : undefined;
    const showEmptyState = widgets.length === 0 && stagedWidgets.length === 0;

    function clearTextSelection() {
        window.getSelection()?.removeAllRanges();
    }

    function handleGridDragStart(_layout: unknown, _oldItem: unknown, _newItem: unknown, _placeholder: unknown, event: Event) {
        if (!layoutEditMode) return;
        setGridInteracting(true);
        clearTextSelection();
        beginDragAutoScroll();
        if ('clientY' in event) trackDragPointer(event.clientY);
    }

    function handleGridDrag(_layout: unknown, _oldItem: unknown, _newItem: unknown, _placeholder: unknown, event: Event) {
        if (!layoutEditMode) return;
        if ('clientY' in event) trackDragPointer(event.clientY);
    }

    function handleGridDragStop() {
        if (!layoutEditMode) return;
        setGridInteracting(false);
        endDragAutoScroll();
        onLayoutSaved?.();
    }

    function handleGridResizeStart() {
        if (!layoutEditMode) return;
        setGridInteracting(true);
        clearTextSelection();
    }

    function handleGridResizeStop() {
        if (!layoutEditMode) return;
        setGridInteracting(false);
        onLayoutSaved?.();
    }

    function handleStagingDragStart(widgetId: string, event: DragEvent<HTMLDivElement>) {
        if (!layoutEditMode) return;
        event.dataTransfer.setData(STAGED_WIDGET_DRAG_MIME, widgetId);
        event.dataTransfer.setData('text/plain', widgetId);
        event.dataTransfer.effectAllowed = 'copy';
        setDraggingStagedWidgetId(widgetId);
        clearTextSelection();
        beginDragAutoScroll();
        trackDragPointer(event.clientY);
    }

    function handleStagingDragEnd() {
        setDraggingStagedWidgetId(null);
        endDragAutoScroll();
    }

    function handleAddWidget(widgetId: string) {
        onAddWidget(widgetId);
        setStagingOpen(true);
    }

    function handleEmitLinkValue(widgetId: string, port: WidgetValuePort, value: string) {
        setLinkValues((prev) => {
            const prevWidget = prev[widgetId] ?? {};
            if (prevWidget[port] === value) return prev;
            return {
                ...prev,
                [widgetId]: {
                    ...prevWidget,
                    [port]: value,
                },
            };
        });
    }

    function handleDrop(
        _layout: readonly WorkspaceLayoutItem[],
        item: WorkspaceLayoutItem | undefined,
        event: Event,
    ) {
        if (!layoutEditMode) return;
        endDragAutoScroll();
        setDraggingStagedWidgetId(null);
        const dragEvent = event as globalThis.DragEvent;
        const droppedWidgetId =
            dragEvent.dataTransfer?.getData(STAGED_WIDGET_DRAG_MIME) ||
            dragEvent.dataTransfer?.getData('text/plain') ||
            draggingStagedWidgetId ||
            item?.i;
        if (!droppedWidgetId || !workspace.stagedWidgetIds.includes(droppedWidgetId)) return;
        const widget = getToolWidget(droppedWidgetId);
        if (!widget) return;
        const width = Math.min(item?.w ?? widget.defaultW, cols);
        const height = item?.h ?? widget.defaultH;
        onPlaceStagedWidget(
            droppedWidgetId,
            { x: item?.x ?? 0, y: item?.y ?? 0, w: width, h: height },
            currentBreakpoint,
        );
        onLayoutSaved?.();
    }

    return (
        <main
            ref={rootRef}
            className={`workspace-dashboard mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6 ${isFullscreen ? 'workspace-dashboard--fullscreen' : ''}`}
        >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <WorkspaceTitleEditor name={workspace.name} onRename={onRenameWorkspace} renameRequestId={renameRequestId} />
                    <p className="text-[14px] text-[var(--color-ink-soft)]">
                        {layoutEditMode
                            ? 'Layout bearbeiten aktiv: Ziehen und Skalieren ist verfügbar, Inhalte sind pausiert.'
                            : 'Nutzungsmodus aktiv: Widgets sind voll bedienbar, Layout bleibt gesperrt.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className={`ms-btn px-3 py-2 text-[13px] ${isFullscreen ? 'bg-[#ff90e8]' : ''}`}
                        onClick={() => void toggleFullscreen()}
                        aria-pressed={isFullscreen}
                        aria-label={isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
                        title={isFullscreen ? 'Vollbild beenden (Esc)' : 'Vollbild'}
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                            {isFullscreen ? (
                                <>
                                    <path d="M9 9H5V5M15 9h4V5M9 15H5v4M15 15h4v4" />
                                </>
                            ) : (
                                <>
                                    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                                </>
                            )}
                        </svg>
                    </button>
                    <button
                        type="button"
                        className={`ms-btn px-3 py-2 text-[13px] ${layoutEditMode ? 'bg-[#fff8b8]' : ''}`}
                        onClick={() => onLayoutEditModeChange(!layoutEditMode)}
                        aria-pressed={layoutEditMode}
                        aria-label={layoutEditMode ? 'Layout sperren' : 'Layout entsperren'}
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                            {layoutEditMode ? (
                                <>
                                    <rect x="4.5" y="10" width="15" height="10" rx="2" />
                                    <path d="M8 10V7a4 4 0 0 1 7.2-2.4" />
                                </>
                            ) : (
                                <>
                                    <rect x="4.5" y="10" width="15" height="10" rx="2" />
                                    <path d="M8 10V7a4 4 0 1 1 8 0v3" />
                                </>
                            )}
                        </svg>
                    </button>
                    <button type="button" className="ms-btn px-3 py-2 text-[13px]" onClick={() => setPickerOpen(true)}>
                        Widget hinzufügen
                    </button>
                    <button type="button" className="ms-btn px-3 py-2 text-[13px]" onClick={onOpenCatalog}>
                        Zum Katalog
                    </button>
                </div>
            </div>

            {stagedWidgets.length > 0 ? (
                <section className="mb-4 overflow-hidden rounded-[12px] border-2 border-black bg-[#fff8b8] shadow-brutal-sm">
                    <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 border-b-2 border-black px-4 py-3 text-left"
                        onClick={() => setStagingOpen((open) => !open)}
                        aria-expanded={stagingOpen}
                    >
                        <span className="font-display text-[14px] font-bold">
                            Bereit zum Platzieren ({stagedWidgets.length})
                        </span>
                        <span className="ms-kbd">{stagingOpen ? '−' : '+'}</span>
                    </button>
                    {stagingOpen ? (
                        <div className="space-y-2 px-4 py-3">
                            <p className="text-[12px] text-[var(--color-ink-soft)]">
                                {layoutEditMode
                                    ? 'Ziehe ein Widget auf das Dashboard, um es zu platzieren.'
                                    : 'Zum Platzieren erst Layout entsperren.'}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {stagedWidgets.map((widget) => (
                                    <div
                                        key={widget.id}
                                        draggable={layoutEditMode}
                                        onDragStart={(event) => handleStagingDragStart(widget.id, event)}
                                        onDragEnd={handleStagingDragEnd}
                                        className={`min-w-[10rem] rounded-[10px] border-2 border-black bg-white px-3 py-2 shadow-[2px_2px_0_#000] ${
                                            layoutEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed opacity-75'
                                        } ${
                                            draggingStagedWidgetId === widget.id ? 'opacity-60' : ''
                                        }`}
                                    >
                                        <div className="widget-drag-handle flex items-start justify-between gap-2 border">
                                            <div className="min-w-0">
                                                <p className="font-display text-[13px] font-bold">{widget.title}</p>
                                                <p className="mt-0.5 text-[11px] text-[var(--color-ink-soft)]">{widget.description}</p>
                                            </div>
                                            <button
                                                type="button"
                                                className="rounded-[6px] border-2 border-black bg-white px-1.5 py-0.5 text-[10px] font-semibold"
                                                onClick={() => onRemoveStagedWidget(widget.id)}
                                                aria-label={`${widget.title} aus Bereitstellung entfernen`}
                                            >
                                                x
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </section>
            ) : null}

            <section className="mb-4 rounded-[12px] border-2 border-black bg-white p-3 shadow-brutal-sm">
                <label htmlFor="workspace-shared-input" className="font-display text-[13px] font-bold">
                    Gemeinsame Eingabe
                </label>
                <p className="mt-0.5 text-[11px] text-[var(--color-ink-soft)]">
                    Ein Wert für alle Widgets, die „Gemeinsame Eingabe" in den Einstellungen aktiviert haben.
                </p>
                <input
                    id="workspace-shared-input"
                    type="text"
                    value={workspace.sharedInput}
                    onChange={(event) => onSharedInputChange(event.target.value)}
                    placeholder="z. B. IBAN, URL oder Text …"
                    className="ms-input mt-2 text-[13px]"
                />
            </section>

            {showEmptyState ? (
                <div className="rounded-[12px] border-2 border-black bg-white p-6 shadow-brutal-sm">
                    <p className="font-display text-[18px] font-bold">Dein Dashboard ist noch leer.</p>
                    <p className="mt-1 text-[14px] text-[var(--color-ink-soft)]">
                        Starte mit empfohlenen Widgets oder stelle dir dein eigenes Setup zusammen.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {suggestedWidgets.map((widget) => (
                            <button
                                key={widget.id}
                                type="button"
                                className="ms-btn px-2.5 py-1 text-[12px]"
                                onClick={() => handleAddWidget(widget.id)}
                            >
                                + {widget.title}
                            </button>
                        ))}
                    </div>
                    <button type="button" className="ms-btn-primary mt-4" onClick={() => setPickerOpen(true)}>
                        Widget hinzufügen
                    </button>
                </div>
            ) : (
                <div
                    ref={gridContainerRef}
                    className={`workspace-canvas rounded-[12px] p-1 ${
                        layoutEditMode
                            ? `workspace-canvas--edit border-2 border-dashed border-black/35${
                                  draggingStagedWidgetId ? ' bg-[#e8f7ff]' : ''
                              }`
                            : ''
                    }`}
                >
                    {widgets.length === 0 ? (
                        <p className="px-3 py-2 text-[12px] text-[var(--color-ink-soft)]">
                            Dashboard leer — ziehe Widgets aus dem Bereitstellungsbereich hierher.
                        </p>
                    ) : null}
                    {gridMounted ? (
                    <GridLayout
                        className="workspace-grid-layout"
                        layout={currentLayout}
                        width={gridWidth}
                        gridConfig={{
                            cols,
                            rowHeight: 48,
                            margin: [12, 12],
                            containerPadding: [0, 0],
                        }}
                        dragConfig={{
                            enabled: layoutEditMode,
                            handle: '.widget-drag-handle',
                            cancel: '.widget-no-drag',
                            threshold: 4,
                        }}
                        resizeConfig={{
                            enabled: layoutEditMode,
                        }}
                        dropConfig={{
                            enabled: Boolean(draggingStagedWidgetId) && layoutEditMode,
                        }}
                        droppingItem={
                            draggingStagedWidget
                                ? {
                                    i: draggingStagedWidget.id,
                                    x: 0,
                                    y: 0,
                                    w: Math.min(draggingStagedWidget.defaultW, cols),
                                    h: draggingStagedWidget.defaultH,
                                    minW: Math.min(draggingStagedWidget.minW, cols),
                                    maxW: Math.min(draggingStagedWidget.maxW, cols),
                                    minH: draggingStagedWidget.minH,
                                    maxH: draggingStagedWidget.maxH,
                                }
                                : undefined
                        }
                        onLayoutChange={(nextLayout) =>
                            onLayoutChange({
                                ...layout,
                                [currentBreakpoint]: [...nextLayout],
                            })
                        }
                        onDragStart={handleGridDragStart}
                        onDrag={handleGridDrag}
                        onDragStop={handleGridDragStop}
                        onResizeStart={handleGridResizeStart}
                        onResizeStop={handleGridResizeStop}
                        onDropDragOver={(event) => {
                            if (!draggingStagedWidgetId || !layoutEditMode) return false;
                            const widget = getToolWidget(draggingStagedWidgetId);
                            if (!widget) return false;
                            event.preventDefault();
                            event.dataTransfer.dropEffect = 'copy';
                            trackDragPointer(event.clientY);
                            return {
                                w: Math.min(widget.defaultW, cols),
                                h: widget.defaultH,
                            };
                        }}
                        onDrop={(nextLayout, item, event) => handleDrop(nextLayout, item, event)}
                    >
                        {widgets.map((widget) => {
                            const tool = getTool(widget.toolId);
                            const WidgetComponent = widget.component;
                            const layoutItem = layoutConfigByWidgetId.get(widget.id);
                            const useSharedInput = resolveUseSharedInput(widget.id, layoutItem?.useSharedInput);
                            const passwordOptions = resolvePasswordOptions(layoutItem?.passwordOptions);
                            const linkedInput = linkedInputByWidget.get(widget.id);
                            const usesLinkedInput = Boolean(linkedInput);
                            const showLinkedIndicator = advancedWidgetLinkingEnabled && widget.supportsLinkedInput && usesLinkedInput;
                            return (
                                <div
                                    key={widget.id}
                                    className={`flex h-full min-h-0 flex-col rounded-[12px] border-2 border-black bg-[var(--color-chip)] shadow-brutal-sm ${
                                        layoutEditMode ? 'border-dashed' : ''
                                    }`}
                                >
                                    <div
                                        className={`widget-drag-handle rounded-t-[12px] relative z-10 flex items-center justify-between overflow-visible border-b-2 border-black bg-white px-3 py-2 ${
                                            layoutEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                                        }`}
                                    >
                                        <div className="flex min-w-0 items-center gap-1.5">
                                            {showLinkedIndicator ? (
                                                <span className="ms-shared-input-indicator ms-info-tip">
                                                    <button
                                                        type="button"
                                                        className="ms-shared-input-indicator__trigger"
                                                        aria-label="Widget-Verknüpfung aktiv"
                                                        aria-describedby={`${widget.id}-linked-input-desc`}
                                                        tabIndex={0}
                                                    >
                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2.5"
                                                            aria-hidden
                                                        >
                                                            <path d="M4 12h16" />
                                                            <path d="M14 6l6 6-6 6" />
                                                        </svg>
                                                    </button>
                                                    <span
                                                        id={`${widget.id}-linked-input-desc`}
                                                        role="tooltip"
                                                        className="ms-info-tip__bubble"
                                                    >
                                                        Nutzt verknüpfte Eingaben von {linkedInput?.label}.
                                                    </span>
                                                </span>
                                            ) : null}
                                            {useSharedInput && widget.supportsSharedInput ? (
                                                <span className="ms-shared-input-indicator ms-info-tip">
                                                    <button
                                                        type="button"
                                                        className="ms-shared-input-indicator__trigger"
                                                        aria-label="Gemeinsame Eingabe"
                                                        aria-describedby={`${widget.id}-shared-input-desc`}
                                                        tabIndex={0}
                                                    >
                                                        <svg
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2.5"
                                                            aria-hidden
                                                        >
                                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                                        </svg>
                                                    </button>
                                                    <span
                                                        id={`${widget.id}-shared-input-desc`}
                                                        role="tooltip"
                                                        className="ms-info-tip__bubble"
                                                    >
                                                        Nutzt den workspace-weiten Wert statt eines lokalen Feldes.
                                                    </span>
                                                </span>
                                            ) : null}
                                            {layoutEditMode ? (
                                                <span className="truncate font-display text-[12px] font-bold">{widget.title}</span>
                                            ) : (
                                                <span className="ms-info-tip min-w-0">
                                                    <button
                                                        type="button"
                                                        className="max-w-full truncate font-display text-[12px] font-bold underline decoration-dotted underline-offset-2"
                                                        onClick={() => onOpenTool(tool.id)}
                                                        aria-describedby={`${widget.id}-title-desc`}
                                                    >
                                                        {widget.title}
                                                    </button>
                                                    <span
                                                        id={`${widget.id}-title-desc`}
                                                        role="tooltip"
                                                        className="ms-info-tip__bubble"
                                                    >
                                                        {widget.description}
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                        <div className="widget-no-drag flex items-center gap-1">
                                            <WidgetSettingsPopover
                                                widget={widget}
                                                open={openSettingsWidgetId === widget.id}
                                                onOpenChange={(open) => setOpenSettingsWidgetId(open ? widget.id : null)}
                                                passwordOptions={passwordOptions}
                                                onPasswordOptionsChange={(options) =>
                                                    onWidgetPasswordOptionsChange(widget.id, options)
                                                }
                                                useSharedInput={useSharedInput}
                                                onUseSharedInputChange={(value) =>
                                                    onToggleWidgetUseSharedInput(widget.id, value)
                                                }
                                                advancedLinkingEnabled={advancedWidgetLinkingEnabled}
                                                sourceWidgets={linkSourceWidgets.filter((entry) => entry.id !== widget.id)}
                                                selectedLinks={linksByTarget.get(widget.id) ?? []}
                                                onSelectedLinksChange={(links) => onWidgetLinksChange(widget.id, links)}
                                            />
                                            {layoutEditMode ? (
                                                <button
                                                    type="button"
                                                    className="rounded-[6px] border-2 border-black bg-white px-1.5 py-0.5 text-[10px] font-semibold"
                                                    onClick={() => onRemoveWidget(widget.id)}
                                                    aria-label={`${widget.title} entfernen`}
                                                >
                                                    x
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="relative flex min-h-0 flex-1 flex-col">
                                        <fieldset disabled={layoutEditMode} className="m-0 flex min-h-0 min-w-0 flex-1 flex-col border-0 p-0">
                                            <div
                                                className={`flex min-h-0 flex-1 flex-col ${
                                                    layoutEditMode ? 'pointer-events-none select-none opacity-65 [&_button]:pointer-events-none [&_input]:pointer-events-none [&_textarea]:pointer-events-none [&_select]:pointer-events-none' : ''
                                                }`}
                                            >
                                                <WidgetComponent
                                                    widgetId={widget.id}
                                                    openTool={() => onOpenTool(tool.id)}
                                                    embedded
                                                    sharedInput={workspace.sharedInput}
                                                    useSharedInput={useSharedInput}
                                                    linkedInput={linkedInput?.value}
                                                    linkedSourceLabel={linkedInput?.label}
                                                    onEmitLinkValue={(port, value) =>
                                                        handleEmitLinkValue(widget.id, port, value)
                                                    }
                                                    passwordOptions={passwordOptions}
                                                    onPasswordOptionsChange={(options) =>
                                                        onWidgetPasswordOptionsChange(widget.id, options)
                                                    }
                                                />
                                            </div>
                                        </fieldset>
                                    </div>
                                </div>
                            );
                        })}
                    </GridLayout>
                    ) : (
                        <div className="min-h-[12rem]" aria-hidden />
                    )}
                </div>
            )}

            {pickerOpen ? (
                <div className="fixed inset-0 z-40 flex items-start justify-center px-4 pt-[10vh]">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/35 backdrop-blur-[4px]"
                        onClick={() => setPickerOpen(false)}
                        aria-label="Widget-Auswahl schließen"
                    />
                    <section className="ms-animate-pop relative z-10 w-full max-w-[44rem] overflow-visible rounded-[16px] border-2 border-black bg-white shadow-brutal-lg">
                        <header className="border-b-2 border-black px-4 py-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-display text-[18px] font-bold">Widget hinzufügen</h2>
                                <button
                                    type="button"
                                    className="rounded-[8px] border-2 border-black bg-white px-2 py-1 text-[12px] font-semibold"
                                    onClick={() => setPickerOpen(false)}
                                >
                                    Esc
                                </button>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    className={`ms-btn px-2.5 py-1 text-[12px] ${pickerMode === 'widgets' ? 'bg-[var(--color-success)]' : ''}`}
                                    onClick={() => setPickerMode('widgets')}
                                >
                                    Widgets
                                </button>
                                <button
                                    type="button"
                                    className={`ms-btn px-2.5 py-1 text-[12px] ${pickerMode === 'tools' ? 'bg-[var(--color-success)]' : ''}`}
                                    onClick={() => setPickerMode('tools')}
                                >
                                    Tool-Set
                                </button>
                                <input
                                    ref={pickerSearchRef}
                                    type="search"
                                    className="ms-input ml-auto max-w-[18rem] py-2 text-[12px]"
                                    placeholder="Suchen …"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                />
                            </div>
                        </header>
                        <div
                            className={
                                pickerMode === 'tools'
                                    ? 'flex max-h-[56vh] flex-col overflow-visible p-4'
                                    : 'max-h-[56vh] overflow-y-auto p-4'
                            }
                        >
                            {pickerMode === 'widgets' ? (
                                filteredWidgets.length > 0 ? (
                                    <ul className="grid gap-2 sm:grid-cols-2">
                                        {filteredWidgets.map((widget) => (
                                            <li key={widget.id} className="rounded-[10px] border-2 border-black bg-[var(--color-chip)] p-3">
                                                <p className="font-display text-[14px] font-bold">{widget.title}</p>
                                                <p className="mt-1 text-[12px] text-[var(--color-ink-soft)]">{widget.description}</p>
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {widget.tags.slice(0, 3).map((tag) => (
                                                        <span key={tag} className="ms-badge border-black bg-white text-[10px]">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="mt-2 text-[11px] text-[var(--color-ink-muted)]">
                                                    Größe {widget.defaultW}x{widget.defaultH} · Min {widget.minW}x{widget.minH}
                                                </p>
                                                <button
                                                    type="button"
                                                    className="ms-btn mt-2 w-full py-1 text-[12px]"
                                                    onClick={() => handleAddWidget(widget.id)}
                                                >
                                                    Hinzufügen
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-[14px] text-[var(--color-ink-soft)]">Keine Widgets gefunden.</p>
                                )
                            ) : (
                                <div className="flex min-h-0 flex-1 flex-col overflow-visible rounded-[12px] border-2 border-black bg-white">
                                    <div className="shrink-0 border-b-2 border-black px-4 py-3">
                                        <div className="ml-auto max-w-[14rem]">
                                            <SettingsToggleRow
                                                id="workspace-tool-set-all"
                                                title="Alle"
                                                description={
                                                    query.trim()
                                                        ? 'Alle gefilterten Tools im Tool-Set ein- oder ausblenden.'
                                                        : 'Alle Tools im Tool-Set ein- oder ausblenden.'
                                                }
                                                checked={allFilteredToolsEnabled}
                                                disabled={filteredTools.length === 0}
                                                variant="plain"
                                                onChange={(enabled) =>
                                                    onSetWorkspaceToolsMembership(
                                                        filteredTools.map((tool) => tool.id),
                                                        enabled,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <ul className="min-h-0 flex-1 overflow-y-auto">
                                        {filteredTools.map((tool, index) => {
                                            const active = workspace.toolIds.includes(tool.id);
                                            const isLast = index === filteredTools.length - 1;
                                            return (
                                                <li
                                                    key={tool.id}
                                                    className={`px-4 py-3 ${isLast ? '' : 'border-b-2 border-black'}`}
                                                >
                                                    <SettingsToggleRow
                                                        id={`workspace-tool-set-${tool.id}`}
                                                        title={tool.shortTitle}
                                                        description={tool.sub}
                                                        checked={active}
                                                        variant="plain"
                                                        onChange={(checked) => {
                                                            if (checked !== active) onToggleWorkspaceTool(tool.id);
                                                        }}
                                                    />
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            ) : null}
        </main>
    );
}
