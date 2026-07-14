import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { allTools, getTool, searchTools, type ToolId } from '../data/catalog';
import { getToolWidget, listToolWidgets } from './widgets/registry';
import type { Workspace, WorkspaceLayoutItem, WorkspaceLayoutSet } from './workspaces/model';
import { useDragAutoScroll } from './useDragAutoScroll';
import GridLayout from 'react-grid-layout';

const STAGED_WIDGET_DRAG_MIME = 'application/x-macheseinfach-widget-id';

type WorkspaceDashboardProps = {
    workspace: Workspace;
    layout: WorkspaceLayoutSet;
    layoutEditMode: boolean;
    onLayoutChange: (next: WorkspaceLayoutSet) => void;
    onLayoutSaved?: () => void;
    onLayoutEditModeChange: (next: boolean) => void;
    onAddWidget: (widgetId: string) => void;
    onRemoveWidget: (widgetId: string) => void;
    onRemoveStagedWidget: (widgetId: string) => void;
    onPlaceStagedWidget: (
        widgetId: string,
        position: Pick<WorkspaceLayoutItem, 'x' | 'y' | 'w' | 'h'>,
        breakpoint: keyof WorkspaceLayoutSet,
    ) => void;
    onToggleWorkspaceTool: (toolId: ToolId) => void;
    onOpenTool: (toolId: ReturnType<typeof getTool>['id']) => void;
    onOpenCatalog: () => void;
};

export function WorkspaceDashboard({
    workspace,
    layout,
    layoutEditMode,
    onLayoutChange,
    onLayoutSaved,
    onLayoutEditModeChange,
    onAddWidget,
    onRemoveWidget,
    onRemoveStagedWidget,
    onPlaceStagedWidget,
    onToggleWorkspaceTool,
    onOpenTool,
    onOpenCatalog,
}: WorkspaceDashboardProps) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerMode, setPickerMode] = useState<'widgets' | 'tools'>('widgets');
    const [query, setQuery] = useState('');
    const [stagingOpen, setStagingOpen] = useState(true);
    const [draggingStagedWidgetId, setDraggingStagedWidgetId] = useState<string | null>(null);
    const [viewportWidth, setViewportWidth] = useState(() =>
        typeof window === 'undefined' ? 1280 : window.innerWidth,
    );
    const { beginDragAutoScroll, endDragAutoScroll, trackDragPointer } = useDragAutoScroll();

    useEffect(() => {
        const onResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

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
        endDragAutoScroll();
    }, [endDragAutoScroll, layoutEditMode]);

    const currentBreakpoint = viewportWidth >= 1200 ? 'lg' : viewportWidth >= 996 ? 'md' : viewportWidth >= 768 ? 'sm' : viewportWidth >= 480 ? 'xs' : 'xxs';
    const cols = currentBreakpoint === 'lg' ? 12 : currentBreakpoint === 'md' ? 10 : currentBreakpoint === 'sm' ? 6 : currentBreakpoint === 'xs' ? 4 : 2;
    const dashboardWidth = Math.max(320, Math.min(1200, viewportWidth - 32));
    const currentLayout = layout[currentBreakpoint] ?? layout.lg ?? [];

    const stagedWidgets = useMemo(
        () => workspace.stagedWidgetIds.map((widgetId) => getToolWidget(widgetId)).filter((widget) => Boolean(widget)),
        [workspace.stagedWidgetIds],
    );

    const widgets = useMemo(
        () => workspace.widgetIds.map((widgetId) => getToolWidget(widgetId)).filter((widget) => Boolean(widget)),
        [workspace.widgetIds],
    );
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

    const suggestedWidgets = useMemo(
        () => listToolWidgets().filter((widget) => ['widget-iban-quick', 'widget-girocode-quick', 'widget-leak-check'].includes(widget.id)),
        [],
    );

    const draggingStagedWidget = draggingStagedWidgetId ? getToolWidget(draggingStagedWidgetId) : undefined;
    const showEmptyState = widgets.length === 0 && stagedWidgets.length === 0;

    function handleGridDragStart(_layout: unknown, _oldItem: unknown, _newItem: unknown, _placeholder: unknown, event: Event) {
        if (!layoutEditMode) return;
        beginDragAutoScroll();
        if ('clientY' in event) trackDragPointer(event.clientY);
    }

    function handleGridDrag(_layout: unknown, _oldItem: unknown, _newItem: unknown, _placeholder: unknown, event: Event) {
        if (!layoutEditMode) return;
        if ('clientY' in event) trackDragPointer(event.clientY);
    }

    function handleGridDragStop() {
        if (!layoutEditMode) return;
        endDragAutoScroll();
        onLayoutSaved?.();
    }

    function handleStagingDragStart(widgetId: string, event: DragEvent<HTMLDivElement>) {
        if (!layoutEditMode) return;
        event.dataTransfer.setData(STAGED_WIDGET_DRAG_MIME, widgetId);
        event.dataTransfer.setData('text/plain', widgetId);
        event.dataTransfer.effectAllowed = 'copy';
        setDraggingStagedWidgetId(widgetId);
        beginDragAutoScroll();
        trackDragPointer(event.clientY);
    }

    function handleStagingDragEnd() {
        setDraggingStagedWidgetId(null);
        endDragAutoScroll();
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
        <main className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="font-display text-[30px] font-bold tracking-[-0.02em]">{workspace.name}</h1>
                    <p className="text-[14px] text-[var(--color-ink-soft)]">
                        {layoutEditMode
                            ? 'Layout bearbeiten aktiv: Ziehen und Skalieren ist verfügbar, Inhalte sind pausiert.'
                            : 'Nutzungsmodus aktiv: Widgets sind voll bedienbar, Layout bleibt gesperrt.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
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
                        {layoutEditMode ? 'Entsperrt' : 'Gesperrt'}
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
                                        <div className="widget-drag-handle flex items-start justify-between gap-2">
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
                                onClick={() => onAddWidget(widget.id)}
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
                    className={`rounded-[12px] border-2 border-dashed border-black/35 p-1 ${
                        draggingStagedWidgetId ? 'bg-[#e8f7ff]' : 'bg-transparent'
                    }`}
                >
                    {widgets.length === 0 ? (
                        <p className="px-3 py-2 text-[12px] text-[var(--color-ink-soft)]">
                            Dashboard leer — ziehe Widgets aus dem Bereitstellungsbereich hierher.
                        </p>
                    ) : null}
                    <GridLayout
                        className="workspace-grid-layout"
                        layout={currentLayout}
                        width={dashboardWidth}
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
                        onResizeStop={() => onLayoutSaved?.()}
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
                            return (
                                <div
                                    key={widget.id}
                                    className={`overflow-hidden rounded-[12px] border-2 border-black bg-[var(--color-chip)] shadow-brutal-sm ${
                                        layoutEditMode ? 'border-dashed ring-2 ring-black/15' : ''
                                    }`}
                                >
                                    <div
                                        className={`widget-drag-handle flex items-center justify-between border-b-2 border-black bg-white px-3 py-2 ${
                                            layoutEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                                        }`}
                                    >
                                        {layoutEditMode ? (
                                            <span className="font-display text-[12px] font-bold">{widget.title}</span>
                                        ) : (
                                            <button
                                                type="button"
                                                className="font-display text-[12px] font-bold underline decoration-dotted underline-offset-2"
                                                onClick={() => onOpenTool(tool.id)}
                                            >
                                                {widget.title}
                                            </button>
                                        )}
                                        <div className={`widget-no-drag flex items-center gap-1 ${layoutEditMode ? 'pointer-events-none opacity-60' : ''}`}>
                                            <button
                                                type="button"
                                                className="rounded-[6px] border-2 border-black bg-white px-1.5 py-0.5 text-[10px] font-semibold"
                                                disabled={layoutEditMode}
                                                aria-disabled={layoutEditMode}
                                                tabIndex={layoutEditMode ? -1 : undefined}
                                                onClick={() => onOpenTool(tool.id)}
                                                aria-label={`${widget.title} als Tool öffnen`}
                                            >
                                                öffnen
                                            </button>
                                            <button
                                                type="button"
                                                className="rounded-[6px] border-2 border-black bg-white px-1.5 py-0.5 text-[10px] font-semibold"
                                                disabled={layoutEditMode}
                                                aria-disabled={layoutEditMode}
                                                tabIndex={layoutEditMode ? -1 : undefined}
                                                onClick={() => onRemoveWidget(widget.id)}
                                                aria-label={`${widget.title} entfernen`}
                                            >
                                                x
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <fieldset disabled={layoutEditMode} className="m-0 min-w-0 border-0 p-0">
                                            <div
                                                className={`${
                                                    layoutEditMode ? 'pointer-events-none select-none opacity-65 [&_button]:pointer-events-none [&_input]:pointer-events-none [&_textarea]:pointer-events-none [&_select]:pointer-events-none' : ''
                                                }`}
                                            >
                                                <WidgetComponent
                                                    widgetId={widget.id}
                                                    openTool={() => onOpenTool(tool.id)}
                                                    embedded
                                                />
                                            </div>
                                        </fieldset>
                                        {layoutEditMode ? (
                                            <span className="pointer-events-none absolute right-2 top-2 rounded-[6px] border-2 border-black border-dashed bg-white px-1.5 py-0.5 text-[10px] font-bold">
                                                Layout bearbeiten
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </GridLayout>
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
                    <section className="ms-animate-pop relative z-10 w-full max-w-[44rem] rounded-[16px] border-2 border-black bg-white shadow-brutal-lg">
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
                                    type="search"
                                    className="ms-input ml-auto max-w-[18rem] py-2 text-[12px]"
                                    placeholder="Suchen …"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                />
                            </div>
                        </header>
                        <div className="max-h-[56vh] overflow-y-auto p-4">
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
                                                    onClick={() => onAddWidget(widget.id)}
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
                                <ul className="space-y-2">
                                    {filteredTools.map((tool) => {
                                        const active = workspace.toolIds.includes(tool.id);
                                        return (
                                            <li key={tool.id} className="rounded-[10px] border-2 border-black bg-white p-3">
                                                <label className="flex cursor-pointer items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={active}
                                                        onChange={() => onToggleWorkspaceTool(tool.id)}
                                                        className="mt-1"
                                                    />
                                                    <span className="min-w-0">
                                                        <span className="font-display text-[14px] font-bold">{tool.shortTitle}</span>
                                                        <span className="mt-1 block text-[12px] text-[var(--color-ink-soft)]">{tool.sub}</span>
                                                    </span>
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </section>
                </div>
            ) : null}
        </main>
    );
}
