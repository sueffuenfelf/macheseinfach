import type { ToolId } from '../../data/catalog';
import { getPreferredWidgetForTool, getToolWidget, listToolWidgets } from '../widgets/registry';

const WORKSPACE_STATE_KEY = 'msf.workspaces.state.v2';
const LEGACY_WORKSPACES_KEY = 'msf.workspaces.v1';
const LEGACY_LAYOUTS_KEY = 'msf.workspace-layouts.v1';

const BREAKPOINTS = ['lg', 'md', 'sm', 'xs', 'xxs'] as const;
type Breakpoint = (typeof BREAKPOINTS)[number];

const COLS_BY_BREAKPOINT: Record<Breakpoint, number> = {
    lg: 12,
    md: 10,
    sm: 6,
    xs: 4,
    xxs: 2,
};

export type Workspace = {
    id: string;
    slug: string;
    name: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
    toolIds: ToolId[];
    widgetIds: string[];
    stagedWidgetIds: string[];
};

export type WorkspaceLayoutItem = {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
};

export type WorkspaceLayoutSet = Partial<Record<Breakpoint, WorkspaceLayoutItem[]>>;
export type WorkspaceLayouts = Record<string, WorkspaceLayoutSet>;

export type WorkspaceState = {
    version: 2;
    workspaces: Workspace[];
    layouts: WorkspaceLayouts;
};

type LegacyWorkspace = {
    id: string;
    name: string;
    widgetIds: string[];
};

export function createWorkspaceId(): string {
    try {
        return crypto.randomUUID();
    } catch {
        return `ws-${Math.random().toString(36).slice(2, 11)}`;
    }
}

export function slugifyWorkspaceName(name: string): string {
    const cleaned = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9äöüß -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return cleaned || 'arbeitsbereich';
}

function uniqueSlug(base: string, existing: Set<string>): string {
    if (!existing.has(base)) return base;
    let index = 2;
    while (existing.has(`${base}-${index}`)) index += 1;
    return `${base}-${index}`;
}

function toolIdsFromWidgets(widgetIds: readonly string[]): ToolId[] {
    const ids = new Set<ToolId>();
    for (const widgetId of widgetIds) {
        const toolId = getToolWidget(widgetId)?.toolId;
        if (toolId) ids.add(toolId);
    }
    return [...ids];
}

function applyWidgetBounds(item: WorkspaceLayoutItem): WorkspaceLayoutItem | null {
    const widget = getToolWidget(item.i);
    if (!widget) return null;
    return {
        ...item,
        minW: widget.minW,
        maxW: widget.maxW,
        minH: widget.minH,
        maxH: widget.maxH,
    };
}

function baseLayoutFor(widgetIds: readonly string[], cols: number): WorkspaceLayoutItem[] {
    let x = 0;
    let y = 0;
    let rowHeight = 0;

    return widgetIds.flatMap((widgetId) => {
        const widget = getToolWidget(widgetId);
        if (!widget) return [];
        const width = Math.min(widget.defaultW, cols);
        if (x + width > cols) {
            x = 0;
            y += Math.max(rowHeight, 3);
            rowHeight = 0;
        }
        const item: WorkspaceLayoutItem = {
            i: widgetId,
            x,
            y,
            w: width,
            h: widget.defaultH,
            minW: Math.min(widget.minW, cols),
            maxW: Math.min(widget.maxW, cols),
            minH: widget.minH,
            maxH: widget.maxH,
        };
        x += width;
        rowHeight = Math.max(rowHeight, widget.defaultH);
        if (x >= cols) {
            x = 0;
            y += Math.max(rowHeight, 3);
            rowHeight = 0;
        }
        return [item];
    });
}

function defaultLayoutSet(widgetIds: readonly string[]): WorkspaceLayoutSet {
    return Object.fromEntries(
        BREAKPOINTS.map((breakpoint) => [breakpoint, baseLayoutFor(widgetIds, COLS_BY_BREAKPOINT[breakpoint])]),
    ) as WorkspaceLayoutSet;
}

function ensureLayoutSet(workspace: Workspace, layout: WorkspaceLayoutSet | undefined): WorkspaceLayoutSet {
    const next: WorkspaceLayoutSet = {};
    for (const breakpoint of BREAKPOINTS) {
        const existing = (layout?.[breakpoint] ?? [])
            .map(applyWidgetBounds)
            .filter((item): item is WorkspaceLayoutItem => Boolean(item));
        const known = new Set(existing.map((item) => item.i));
        const missing = workspace.widgetIds.filter((widgetId) => !known.has(widgetId));
        const fallback = baseLayoutFor(missing, COLS_BY_BREAKPOINT[breakpoint]);
        next[breakpoint] = [...existing, ...fallback];
    }
    return next;
}

function createDefaultWorkspace(): Workspace {
    const defaultWidgetIds = [
        'widget-iban-quick',
        'widget-girocode-quick',
        'widget-leak-check',
    ].filter((widgetId) => Boolean(getToolWidget(widgetId)));
    const createdAt = new Date().toISOString();
    return {
        id: createWorkspaceId(),
        slug: 'start',
        name: 'Start',
        isDefault: true,
        createdAt,
        updatedAt: createdAt,
        widgetIds: defaultWidgetIds,
        toolIds: toolIdsFromWidgets(defaultWidgetIds),
        stagedWidgetIds: [],
    };
}

function normalizeState(workspaces: Workspace[], layouts: WorkspaceLayouts): WorkspaceState {
    const fallback = createDefaultWorkspace();
    const base = workspaces.length > 0 ? workspaces : [fallback];
    const slugSet = new Set<string>();
    let sawDefault = false;
    const normalized = base.map((workspace, index) => {
        const cleanName = workspace.name.trim() || `Arbeitsbereich ${index + 1}`;
        const slug = uniqueSlug(slugifyWorkspaceName(workspace.slug || cleanName), slugSet);
        slugSet.add(slug);
        const widgetIds = workspace.widgetIds.filter((widgetId) => Boolean(getToolWidget(widgetId)));
        const stagedWidgetIds = (workspace.stagedWidgetIds ?? []).filter(
            (widgetId) => Boolean(getToolWidget(widgetId)) && !widgetIds.includes(widgetId),
        );
        const toolIds = [...new Set([...workspace.toolIds, ...toolIdsFromWidgets(widgetIds), ...toolIdsFromWidgets(stagedWidgetIds)])];
        const createdAt = workspace.createdAt || new Date().toISOString();
        const updatedAt = workspace.updatedAt || createdAt;
        const isDefault = workspace.isDefault && !sawDefault;
        if (isDefault) sawDefault = true;
        return {
            ...workspace,
            name: cleanName,
            slug,
            widgetIds,
            stagedWidgetIds,
            toolIds,
            createdAt,
            updatedAt,
            isDefault,
        };
    });

    if (!sawDefault && normalized[0]) {
        normalized[0] = { ...normalized[0], isDefault: true };
    }

    const nextLayouts: WorkspaceLayouts = {};
    for (const workspace of normalized) {
        nextLayouts[workspace.id] = ensureLayoutSet(workspace, layouts[workspace.id]);
    }
    return { version: 2, workspaces: normalized, layouts: nextLayouts };
}

function migrateLegacyState(): WorkspaceState {
    const rawWorkspaces = localStorage.getItem(LEGACY_WORKSPACES_KEY);
    if (!rawWorkspaces) {
        const workspace = createDefaultWorkspace();
        return normalizeState([workspace], { [workspace.id]: defaultLayoutSet(workspace.widgetIds) });
    }
    let parsedWorkspaces: LegacyWorkspace[] = [];
    let parsedLayouts: Record<string, WorkspaceLayoutItem[]> = {};
    try {
        const candidate = JSON.parse(rawWorkspaces) as unknown;
        if (Array.isArray(candidate)) {
            parsedWorkspaces = candidate.filter(
                (entry): entry is LegacyWorkspace =>
                    Boolean(entry) &&
                    typeof entry === 'object' &&
                    typeof (entry as LegacyWorkspace).id === 'string' &&
                    typeof (entry as LegacyWorkspace).name === 'string' &&
                    Array.isArray((entry as LegacyWorkspace).widgetIds),
            );
        }
    } catch {
        parsedWorkspaces = [];
    }
    try {
        const rawLayouts = localStorage.getItem(LEGACY_LAYOUTS_KEY);
        if (rawLayouts) {
            parsedLayouts = JSON.parse(rawLayouts) as Record<string, WorkspaceLayoutItem[]>;
        }
    } catch {
        parsedLayouts = {};
    }

    if (parsedWorkspaces.length === 0) {
        const workspace = createDefaultWorkspace();
        return normalizeState([workspace], { [workspace.id]: defaultLayoutSet(workspace.widgetIds) });
    }

    const slugSet = new Set<string>();
    const migratedWorkspaces: Workspace[] = parsedWorkspaces.map((legacy, index) => {
        const now = new Date().toISOString();
        const slug = uniqueSlug(slugifyWorkspaceName(legacy.name || legacy.id), slugSet);
        slugSet.add(slug);
        const widgetIds = legacy.widgetIds.filter((widgetId) => Boolean(getToolWidget(widgetId)));
        return {
            id: createWorkspaceId(),
            slug,
            name: legacy.name.trim() || `Arbeitsbereich ${index + 1}`,
            isDefault: index === 0,
            createdAt: now,
            updatedAt: now,
            widgetIds,
            toolIds: toolIdsFromWidgets(widgetIds),
            stagedWidgetIds: [],
        };
    });

    const migratedLayouts: WorkspaceLayouts = {};
    migratedWorkspaces.forEach((workspace, index) => {
        const oldWorkspaceId = parsedWorkspaces[index]?.id;
        const legacyLayout = oldWorkspaceId ? parsedLayouts[oldWorkspaceId] : [];
        migratedLayouts[workspace.id] = {
            lg: (legacyLayout ?? []).map(applyWidgetBounds).filter((item): item is WorkspaceLayoutItem => Boolean(item)),
        };
    });

    return normalizeState(migratedWorkspaces, migratedLayouts);
}

export function loadWorkspaceState(): WorkspaceState {
    try {
        const raw = localStorage.getItem(WORKSPACE_STATE_KEY);
        if (!raw) return migrateLegacyState();
        const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
        if (parsed.version !== 2 || !Array.isArray(parsed.workspaces) || typeof parsed.layouts !== 'object') {
            return migrateLegacyState();
        }
        return normalizeState(parsed.workspaces as Workspace[], parsed.layouts as WorkspaceLayouts);
    } catch {
        return migrateLegacyState();
    }
}

export function saveWorkspaceState(state: WorkspaceState): void {
    try {
        localStorage.setItem(WORKSPACE_STATE_KEY, JSON.stringify(state));
    } catch {
        // Ignore localStorage errors in private mode.
    }
}

export function createWorkspace(
    state: WorkspaceState,
    input: { name?: string; duplicateFromId?: string } = {},
): { state: WorkspaceState; workspace: Workspace } {
    const source = input.duplicateFromId
        ? state.workspaces.find((workspace) => workspace.id === input.duplicateFromId)
        : undefined;
    const now = new Date().toISOString();
    const nameBase = input.name?.trim() || (source ? `${source.name} Kopie` : `Arbeitsbereich ${state.workspaces.length + 1}`);
    const slug = uniqueSlug(slugifyWorkspaceName(nameBase), new Set(state.workspaces.map((workspace) => workspace.slug)));
    const workspace: Workspace = {
        id: createWorkspaceId(),
        slug,
        name: nameBase,
        isDefault: state.workspaces.length === 0,
        createdAt: now,
        updatedAt: now,
        widgetIds: source?.widgetIds ?? [],
        toolIds: source?.toolIds ?? toolIdsFromWidgets(source?.widgetIds ?? []),
        stagedWidgetIds: source?.stagedWidgetIds ?? [],
    };
    const nextState = normalizeState(
        [...state.workspaces, workspace],
        {
            ...state.layouts,
            [workspace.id]: source
                ? ensureLayoutSet(source, state.layouts[source.id])
                : defaultLayoutSet(workspace.widgetIds),
        },
    );
    const created = nextState.workspaces.find((entry) => entry.id === workspace.id) ?? workspace;
    return { state: nextState, workspace: created };
}

export function renameWorkspace(state: WorkspaceState, workspaceId: string, name: string): WorkspaceState {
    const trimmed = name.trim();
    if (!trimmed) return state;
    const existing = state.workspaces.find((workspace) => workspace.id === workspaceId);
    if (!existing) return state;
    const slugSet = new Set(state.workspaces.filter((workspace) => workspace.id !== workspaceId).map((workspace) => workspace.slug));
    const nextSlug = uniqueSlug(slugifyWorkspaceName(trimmed), slugSet);
    const nextWorkspaces = state.workspaces.map((workspace) =>
        workspace.id === workspaceId
            ? { ...workspace, name: trimmed, slug: nextSlug, updatedAt: new Date().toISOString() }
            : workspace,
    );
    return normalizeState(nextWorkspaces, state.layouts);
}

export function setDefaultWorkspace(state: WorkspaceState, workspaceId: string): WorkspaceState {
    if (!state.workspaces.some((workspace) => workspace.id === workspaceId)) return state;
    const next = state.workspaces.map((workspace) => ({ ...workspace, isDefault: workspace.id === workspaceId }));
    return normalizeState(next, state.layouts);
}

export function deleteWorkspace(state: WorkspaceState, workspaceId: string): WorkspaceState {
    if (state.workspaces.length <= 1) return state;
    if (!state.workspaces.some((workspace) => workspace.id === workspaceId)) return state;
    const nextWorkspaces = state.workspaces.filter((workspace) => workspace.id !== workspaceId);
    const nextLayouts = { ...state.layouts };
    delete nextLayouts[workspaceId];
    return normalizeState(nextWorkspaces, nextLayouts);
}

export function reorderWorkspaces(state: WorkspaceState, fromIndex: number, toIndex: number): WorkspaceState {
    if (fromIndex === toIndex) return state;
    if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= state.workspaces.length ||
        toIndex >= state.workspaces.length
    ) {
        return state;
    }
    const next = [...state.workspaces];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return normalizeState(next, state.layouts);
}

export function addWidgetToWorkspace(state: WorkspaceState, workspaceId: string, widgetId: string): WorkspaceState {
    const widget = getToolWidget(widgetId);
    if (!widget) return state;
    const nextWorkspaces = state.workspaces.map((workspace) => {
        if (workspace.id !== workspaceId || workspace.widgetIds.includes(widgetId)) return workspace;
        return {
            ...workspace,
            updatedAt: new Date().toISOString(),
            widgetIds: [...workspace.widgetIds, widgetId],
            stagedWidgetIds: workspace.stagedWidgetIds.filter((id) => id !== widgetId),
            toolIds: workspace.toolIds.includes(widget.toolId) ? workspace.toolIds : [...workspace.toolIds, widget.toolId],
        };
    });
    return normalizeState(nextWorkspaces, state.layouts);
}

export type AddToolToWorkspaceResult = {
    state: WorkspaceState;
    widgetId: string | null;
    reason: 'added' | 'already-placed' | 'already-staged' | 'no-widget' | 'no-workspace';
};

export function addToolToWorkspaceStaging(
    state: WorkspaceState,
    workspaceId: string,
    toolId: ToolId,
): AddToolToWorkspaceResult {
    const widget = getPreferredWidgetForTool(toolId);
    if (!widget) return { state, widgetId: null, reason: 'no-widget' };
    const workspace = state.workspaces.find((entry) => entry.id === workspaceId);
    if (!workspace) return { state, widgetId: null, reason: 'no-workspace' };
    if (workspace.widgetIds.includes(widget.id)) {
        return { state, widgetId: widget.id, reason: 'already-placed' };
    }
    if (workspace.stagedWidgetIds.includes(widget.id)) {
        return { state, widgetId: widget.id, reason: 'already-staged' };
    }
    return {
        state: addWidgetToWorkspaceStaging(state, workspaceId, widget.id),
        widgetId: widget.id,
        reason: 'added',
    };
}

export function addWidgetToWorkspaceStaging(state: WorkspaceState, workspaceId: string, widgetId: string): WorkspaceState {
    const widget = getToolWidget(widgetId);
    if (!widget) return state;
    const nextWorkspaces = state.workspaces.map((workspace) => {
        if (workspace.id !== workspaceId) return workspace;
        if (workspace.widgetIds.includes(widgetId) || workspace.stagedWidgetIds.includes(widgetId)) return workspace;
        return {
            ...workspace,
            updatedAt: new Date().toISOString(),
            stagedWidgetIds: [widgetId, ...workspace.stagedWidgetIds],
            toolIds: workspace.toolIds.includes(widget.toolId) ? workspace.toolIds : [...workspace.toolIds, widget.toolId],
        };
    });
    return normalizeState(nextWorkspaces, state.layouts);
}

export function removeStagedWidget(state: WorkspaceState, workspaceId: string, widgetId: string): WorkspaceState {
    const nextWorkspaces = state.workspaces.map((workspace) =>
        workspace.id === workspaceId
            ? {
                ...workspace,
                updatedAt: new Date().toISOString(),
                stagedWidgetIds: workspace.stagedWidgetIds.filter((id) => id !== widgetId),
            }
            : workspace,
    );
    return normalizeState(nextWorkspaces, state.layouts);
}

export function placeStagedWidget(
    state: WorkspaceState,
    workspaceId: string,
    widgetId: string,
    position: Pick<WorkspaceLayoutItem, 'x' | 'y' | 'w' | 'h'>,
    breakpoint: Breakpoint = 'lg',
): WorkspaceState {
    const widget = getToolWidget(widgetId);
    if (!widget) return state;
    const workspace = state.workspaces.find((entry) => entry.id === workspaceId);
    if (!workspace) return state;
    if (!workspace.stagedWidgetIds.includes(widgetId) && !workspace.widgetIds.includes(widgetId)) return state;

    const cols = COLS_BY_BREAKPOINT[breakpoint];
    const width = Math.min(position.w ?? widget.defaultW, cols);
    const height = position.h ?? widget.defaultH;
    const layoutItem: WorkspaceLayoutItem = {
        i: widgetId,
        x: Math.max(0, Math.min(position.x, Math.max(0, cols - width))),
        y: Math.max(0, position.y),
        w: width,
        h: height,
        minW: Math.min(widget.minW, cols),
        maxW: Math.min(widget.maxW, cols),
        minH: widget.minH,
        maxH: widget.maxH,
    };

    const nextWorkspaces = state.workspaces.map((entry) => {
        if (entry.id !== workspaceId) return entry;
        return {
            ...entry,
            updatedAt: new Date().toISOString(),
            stagedWidgetIds: entry.stagedWidgetIds.filter((id) => id !== widgetId),
            widgetIds: entry.widgetIds.includes(widgetId) ? entry.widgetIds : [...entry.widgetIds, widgetId],
            toolIds: entry.toolIds.includes(widget.toolId) ? entry.toolIds : [...entry.toolIds, widget.toolId],
        };
    });

    const layoutSet = state.layouts[workspaceId] ?? {};
    const nextLayoutSet: WorkspaceLayoutSet = { ...layoutSet };
    for (const bp of BREAKPOINTS) {
        const bpCols = COLS_BY_BREAKPOINT[bp];
        const existing = (nextLayoutSet[bp] ?? []).filter((item) => item.i !== widgetId);
        const item =
            bp === breakpoint
                ? layoutItem
                : {
                    ...layoutItem,
                    w: Math.min(width, bpCols),
                    x: Math.max(0, Math.min(layoutItem.x, Math.max(0, bpCols - Math.min(width, bpCols)))),
                };
        nextLayoutSet[bp] = [...existing, item];
    }

    return normalizeState(nextWorkspaces, { ...state.layouts, [workspaceId]: nextLayoutSet });
}

export function removeWidgetFromWorkspace(state: WorkspaceState, workspaceId: string, widgetId: string): WorkspaceState {
    const nextWorkspaces = state.workspaces.map((workspace) =>
        workspace.id === workspaceId
            ? {
                ...workspace,
                updatedAt: new Date().toISOString(),
                widgetIds: workspace.widgetIds.filter((id) => id !== widgetId),
            }
            : workspace,
    );
    const nextLayouts = { ...state.layouts };
    const layoutSet = nextLayouts[workspaceId];
    if (layoutSet) {
        nextLayouts[workspaceId] = Object.fromEntries(
            BREAKPOINTS.map((breakpoint) => [
                breakpoint,
                (layoutSet[breakpoint] ?? []).filter((item) => item.i !== widgetId),
            ]),
        ) as WorkspaceLayoutSet;
    }
    return normalizeState(nextWorkspaces, nextLayouts);
}

export function toggleWorkspaceTool(state: WorkspaceState, workspaceId: string, toolId: ToolId): WorkspaceState {
    const nextWorkspaces = state.workspaces.map((workspace) => {
        if (workspace.id !== workspaceId) return workspace;
        const has = workspace.toolIds.includes(toolId);
        return {
            ...workspace,
            updatedAt: new Date().toISOString(),
            toolIds: has ? workspace.toolIds.filter((id) => id !== toolId) : [...workspace.toolIds, toolId],
        };
    });
    return normalizeState(nextWorkspaces, state.layouts);
}

export function setWorkspaceLayout(
    state: WorkspaceState,
    workspaceId: string,
    layoutSet: WorkspaceLayoutSet,
): WorkspaceState {
    const nextLayouts = {
        ...state.layouts,
        [workspaceId]: layoutSet,
    };
    return normalizeState(state.workspaces, nextLayouts);
}

export function defaultWorkspace(state: WorkspaceState): Workspace {
    return state.workspaces.find((workspace) => workspace.isDefault) ?? state.workspaces[0];
}

export function listAvailableWidgetIds(): string[] {
    return listToolWidgets().map((widget) => widget.id);
}
