import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { useToast } from '../shell/toast';
import {
    allTools,
    getTool,
    stories,
    toolsForStory,
    type AreaId,
    type StoryId,
    type Tool,
    type ToolId,
} from '../data/catalog';
import type { AppPage } from '../routing/paths';

export type PlatformFile = {
    name: string;
    sizeLabel: string;
    /** Size in bytes for tooling */
    bytes: number;
};

export type SituationVariant = 'grid' | 'cards' | 'list';
export type ShellView = 'main' | 'settings';

export type RouteSnapshot = {
    page: AppPage;
    workspaceId: string | null;
    areaId: AreaId | null;
    storyId: StoryId | null;
    tool: Tool | null;
    tags: readonly string[];
};

type PlatformContextValue = {
    page: AppPage;
    activeWorkspaceId: string | null;
    shellView: ShellView;
    activeAreaId: AreaId | null;
    activeStoryId: StoryId | null;
    activeTool: Tool | null;
    /** Alias für bestehende Komponenten */
    activeScenario: Tool | null;
    file: PlatformFile | null;
    paletteOpen: boolean;
    variant: SituationVariant;
    query: string;
    /** Leer = alle Tags neutral (kein Filter); sonst AND-Filter über ausgewählte Tags */
    activeTags: readonly string[];
    recentTools: ToolId[];
    favorites: ToolId[];
    selectArea: (areaId: AreaId) => void;
    selectStory: (storyId: StoryId) => void;
    selectTool: (toolId: ToolId) => void;
    clearTool: () => void;
    goHome: () => void;
    goToSituation: () => void;
    openSettings: () => void;
    closeSettings: () => void;
    clearFile: () => void;
    ingestFiles: (files: FileList | null) => PlatformFile | null;
    setFile: (file: PlatformFile | null) => void;
    openPalette: () => void;
    closePalette: () => void;
    setVariant: (v: SituationVariant) => void;
    setQuery: (q: string) => void;
    /** Multi-Select: Tag an-/abwählen */
    toggleTag: (tag: string) => void;
    clearTagFilter: () => void;
    toggleFavorite: (toolId: ToolId) => void;
    isFavorite: (toolId: ToolId) => boolean;
    pushRecent: (toolId: ToolId) => void;
    applyRoute: (snapshot: RouteSnapshot) => void;
    setActiveTags: (tags: readonly string[]) => void;
};

const PlatformContext = createContext<PlatformContextValue | null>(null);

const RECENT_KEY = 'msf.recentTools';
const FAV_KEY = 'msf.favorites';
const MAX_RECENT = 6;

function readStored(key: string): ToolId[] {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        const ids = new Set(allTools.map((t) => t.id));
        return parsed.filter((v): v is ToolId => typeof v === 'string' && ids.has(v as ToolId));
    } catch {
        return [];
    }
}

function writeStored(key: string, value: ToolId[]): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* ignore quota / private mode */
    }
}

export function PlatformProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const [page, setPage] = useState<AppPage>('home');
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
    const [shellView, setShellView] = useState<ShellView>('main');
    const [activeAreaId, setActiveAreaId] = useState<AreaId | null>(null);
    const [activeStoryId, setActiveStoryId] = useState<StoryId | null>(null);
    const [activeTool, setActiveTool] = useState<Tool | null>(null);
    const [file, setFileState] = useState<PlatformFile | null>(null);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [variant, setVariantState] = useState<SituationVariant>('grid');
    const [query, setQueryState] = useState('');
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [recentTools, setRecentTools] = useState<ToolId[]>(() => readStored(RECENT_KEY));
    const [favorites, setFavorites] = useState<ToolId[]>(() => readStored(FAV_KEY));

    const pushRecent = useCallback((toolId: ToolId) => {
        setRecentTools((prev) => {
            const next = [toolId, ...prev.filter((id) => id !== toolId)].slice(0, MAX_RECENT);
            writeStored(RECENT_KEY, next);
            return next;
        });
    }, []);

    const applyRoute = useCallback((snapshot: RouteSnapshot) => {
        setPage(snapshot.page);
        setActiveWorkspaceId(snapshot.workspaceId);
        setShellView(snapshot.page === 'settings' ? 'settings' : 'main');
        setActiveAreaId(snapshot.areaId);
        setActiveStoryId(snapshot.storyId);
        setActiveTool(snapshot.tool);
        setActiveTags([...snapshot.tags]);
        if (
            snapshot.page === 'home' ||
            snapshot.page === 'workspace' ||
            snapshot.page === 'favorites' ||
            snapshot.page === 'settings'
        ) {
            setFileState(null);
        }
        if (snapshot.page === 'home' || snapshot.page === 'workspace') {
            setQueryState('');
        }
        if (snapshot.tool) {
            setFileState(null);
        }
    }, []);

    const setActiveTagsDirect = useCallback((tags: readonly string[]) => {
        setActiveTags([...tags]);
    }, []);

    const selectArea = useCallback(
        (areaId: AreaId) => {
            setActiveAreaId(areaId);
            setActiveStoryId(null);
            setActiveTool(null);
            setFileState(null);
            setQueryState('');
        },
        [],
    );

    const selectTool = useCallback(
        (toolId: ToolId) => {
            const tool = getTool(toolId);
            setActiveAreaId((prev) => (prev && tool.areas.includes(prev) ? prev : (tool.areas[0] ?? null)));
            setActiveStoryId((prev) => (prev && tool.storyIds.includes(prev) ? prev : (tool.storyIds[0] ?? null)));
            setActiveTool(tool);
            pushRecent(toolId);
        },
        [pushRecent],
    );

    const selectStory = useCallback(
        (storyId: StoryId) => {
            const story = stories[storyId];
            setActiveStoryId(storyId);
            setFileState(null);
            const storyTools = toolsForStory(storyId);
            if (storyTools.length === 1) {
                selectTool(storyTools[0].id);
                return;
            }
            setActiveTool(null);
        },
        [selectTool],
    );

    const clearTool = useCallback(() => {
        setActiveTool(null);
        setFileState(null);
    }, []);

    const goHome = useCallback(() => {
        setShellView('main');
        setActiveAreaId(null);
        setActiveStoryId(null);
        setActiveTool(null);
        setFileState(null);
        setQueryState('');
        setActiveTags([]);
    }, []);

    const openSettings = useCallback(() => setShellView('settings'), []);
    const closeSettings = useCallback(() => setShellView('main'), []);

    const toggleTag = useCallback(
        (tag: string) => {
            const selected = activeTags.includes(tag);
            const next = selected ? activeTags.filter((t) => t !== tag) : [...activeTags, tag];
            setActiveTags(next);
            toast({
                message: selected ? `Tag „${tag}" abgewählt` : `Tag „${tag}" aktiv`,
                variant: 'info',
            });
        },
        [activeTags, toast],
    );

    const clearTagFilter = useCallback(() => setActiveTags([]), []);

    const goToSituation = useCallback(() => {
        setActiveTool(null);
        setFileState(null);
    }, []);

    const setFile = useCallback((f: PlatformFile | null) => setFileState(f), []);

    const clearFile = useCallback(() => setFileState(null), []);

    const ingestFiles = useCallback((files: FileList | null): PlatformFile | null => {
            if (!files?.length) return null;
            const f = files[0];
            const info: PlatformFile = {
                name: f.name,
                sizeLabel: formatBytes(f.size),
                bytes: f.size,
            };
            setFileState(info);
            return info;
        }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setPaletteOpen(true);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const toggleFavorite = useCallback(
        (toolId: ToolId) => {
            const tool = getTool(toolId);
            const removing = favorites.includes(toolId);
            const next = removing ? favorites.filter((id) => id !== toolId) : [toolId, ...favorites];
            setFavorites(next);
            writeStored(FAV_KEY, next);
            toast({
                message: removing
                    ? `${tool.shortTitle} aus Favoriten entfernt`
                    : `${tool.shortTitle} zu Favoriten hinzugefügt`,
                variant: 'success',
            });
        },
        [favorites, toast],
    );

    const isFavorite = useCallback((toolId: ToolId) => favorites.includes(toolId), [favorites]);

    const value = useMemo<PlatformContextValue>(
        () => ({
            page,
            activeWorkspaceId,
            shellView,
            activeAreaId,
            activeStoryId,
            activeTool,
            activeScenario: activeTool,
            file,
            paletteOpen,
            variant,
            query,
            activeTags,
            recentTools,
            favorites,
            selectArea,
            selectStory,
            selectTool,
            clearTool,
            goHome,
            goToSituation,
            openSettings,
            closeSettings,
            clearFile,
            ingestFiles,
            setFile,
            openPalette: () => setPaletteOpen(true),
            closePalette: () => setPaletteOpen(false),
            setVariant: (v) => setVariantState(v),
            setQuery: (q) => setQueryState(q),
            toggleTag,
            clearTagFilter,
            toggleFavorite,
            isFavorite,
            pushRecent,
            applyRoute,
            setActiveTags: setActiveTagsDirect,
        }),
        [
            page,
            activeWorkspaceId,
            shellView,
            activeAreaId,
            activeStoryId,
            activeTool,
            file,
            paletteOpen,
            variant,
            query,
            activeTags,
            recentTools,
            favorites,
            selectArea,
            selectStory,
            selectTool,
            clearTool,
            goHome,
            goToSituation,
            openSettings,
            closeSettings,
            clearFile,
            ingestFiles,
            setFile,
            toggleTag,
            clearTagFilter,
            toggleFavorite,
            isFavorite,
            pushRecent,
            applyRoute,
            setActiveTagsDirect,
        ],
    );

    return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform(): PlatformContextValue {
    const ctx = useContext(PlatformContext);
    if (!ctx) throw new Error('usePlatform must be used within PlatformProvider');
    return ctx;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
