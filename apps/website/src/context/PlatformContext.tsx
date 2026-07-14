import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import {
    allTools,
    findToolsForFile,
    getTool,
    stories,
    toolsForStory,
    type AreaId,
    type StoryId,
    type Tool,
    type ToolId,
} from '../data/catalog';

export type PlatformFile = {
    name: string;
    sizeLabel: string;
    /** Size in bytes for tooling */
    bytes: number;
};

export type SituationVariant = 'sentences' | 'search' | 'tiles';

type PlatformContextValue = {
    activeAreaId: AreaId | null;
    activeStoryId: StoryId | null;
    activeTool: Tool | null;
    /** Alias für bestehende Komponenten */
    activeScenario: Tool | null;
    file: PlatformFile | null;
    paletteOpen: boolean;
    variant: SituationVariant;
    query: string;
    recentTools: ToolId[];
    favorites: ToolId[];
    selectArea: (areaId: AreaId) => void;
    selectStory: (storyId: StoryId) => void;
    selectTool: (toolId: ToolId) => void;
    clearTool: () => void;
    goHome: () => void;
    goToSituation: () => void;
    clearFile: () => void;
    ingestFiles: (files: FileList | null) => PlatformFile | null;
    setFile: (file: PlatformFile | null) => void;
    openPalette: () => void;
    closePalette: () => void;
    setVariant: (v: SituationVariant) => void;
    setQuery: (q: string) => void;
    toggleFavorite: (toolId: ToolId) => void;
    isFavorite: (toolId: ToolId) => boolean;
    pushRecent: (toolId: ToolId) => void;
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
    const [activeAreaId, setActiveAreaId] = useState<AreaId | null>(null);
    const [activeStoryId, setActiveStoryId] = useState<StoryId | null>(null);
    const [activeTool, setActiveTool] = useState<Tool | null>(null);
    const [file, setFileState] = useState<PlatformFile | null>(null);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [variant, setVariantState] = useState<SituationVariant>('sentences');
    const [query, setQueryState] = useState('');
    const [recentTools, setRecentTools] = useState<ToolId[]>(() => readStored(RECENT_KEY));
    const [favorites, setFavorites] = useState<ToolId[]>(() => readStored(FAV_KEY));

    const pushRecent = useCallback((toolId: ToolId) => {
        setRecentTools((prev) => {
            const next = [toolId, ...prev.filter((id) => id !== toolId)].slice(0, MAX_RECENT);
            writeStored(RECENT_KEY, next);
            return next;
        });
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
        setActiveAreaId(null);
        setActiveStoryId(null);
        setActiveTool(null);
        setFileState(null);
        setQueryState('');
    }, []);

    const goToSituation = useCallback(() => {
        setActiveTool(null);
        setFileState(null);
    }, []);

    const setFile = useCallback((f: PlatformFile | null) => setFileState(f), []);

    const clearFile = useCallback(() => setFileState(null), []);

    const ingestFiles = useCallback(
        (files: FileList | null): PlatformFile | null => {
            if (!files?.length) return null;
            const f = files[0];
            const info: PlatformFile = {
                name: f.name,
                sizeLabel: formatBytes(f.size),
                bytes: f.size,
            };
            setFileState(info);
            const matched = findToolsForFile(f.name);
            if (matched[0]) selectTool(matched[0].id);
            return info;
        },
        [selectTool],
    );

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

    const toggleFavorite = useCallback((toolId: ToolId) => {
        setFavorites((prev) => {
            const next = prev.includes(toolId)
                ? prev.filter((id) => id !== toolId)
                : [toolId, ...prev];
            writeStored(FAV_KEY, next);
            return next;
        });
    }, []);

    const isFavorite = useCallback((toolId: ToolId) => favorites.includes(toolId), [favorites]);

    const value = useMemo<PlatformContextValue>(
        () => ({
            activeAreaId,
            activeStoryId,
            activeTool,
            activeScenario: activeTool,
            file,
            paletteOpen,
            variant,
            query,
            recentTools,
            favorites,
            selectArea,
            selectStory,
            selectTool,
            clearTool,
            goHome,
            goToSituation,
            clearFile,
            ingestFiles,
            setFile,
            openPalette: () => setPaletteOpen(true),
            closePalette: () => setPaletteOpen(false),
            setVariant: (v) => setVariantState(v),
            setQuery: (q) => setQueryState(q),
            toggleFavorite,
            isFavorite,
            pushRecent,
        }),
        [
            activeAreaId,
            activeStoryId,
            activeTool,
            file,
            paletteOpen,
            variant,
            query,
            recentTools,
            favorites,
            selectArea,
            selectStory,
            selectTool,
            clearTool,
            goHome,
            goToSituation,
            clearFile,
            ingestFiles,
            setFile,
            toggleFavorite,
            isFavorite,
            pushRecent,
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
