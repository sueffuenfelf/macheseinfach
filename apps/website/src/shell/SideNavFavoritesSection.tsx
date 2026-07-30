import { useState } from 'react';
import { getTool, type ToolId } from '../data/catalog';
import { SideNavFavoriteItem } from './SideNavItem';

const FAVORITES_PREVIEW = 5;

type SideNavFavoritesSectionProps = {
    favorites: ToolId[];
    activeToolId: ToolId | null;
    onSelectTool: (toolId: ToolId) => void;
    onNavigate?: () => void;
};

function StarIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#ffc900" stroke="black" strokeWidth="2" aria-hidden>
            <path d="M12 3.8l2.68 5.43 5.99.87-4.33 4.22 1.02 5.96L12 17.43l-5.36 2.83 1.02-5.96-4.33-4.22 5.99-.87z" />
        </svg>
    );
}

export function SideNavFavoritesSection({
    favorites,
    activeToolId,
    onSelectTool,
    onNavigate,
}: SideNavFavoritesSectionProps) {
    const [expanded, setExpanded] = useState(false);

    const favoriteTools = favorites
        .map((toolId) => ({ toolId, tool: getTool(toolId) }))
        .filter((entry): entry is { toolId: ToolId; tool: NonNullable<ReturnType<typeof getTool>> } =>
            Boolean(entry.tool),
        );

    if (favoriteTools.length === 0) return null;

    const hasMore = favoriteTools.length > FAVORITES_PREVIEW;
    const visibleEntries = expanded ? favoriteTools : favoriteTools.slice(0, FAVORITES_PREVIEW);
    const hiddenCount = favoriteTools.length - FAVORITES_PREVIEW;

    return (
        <div className="mt-2 shrink-0 px-2">
            <div className="flex items-center justify-between px-2.5 py-1">
                <p className="font-display text-[11px] font-bold tracking-[0.05em] text-[var(--color-ink-muted)] uppercase">
                    Favoriten
                </p>
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-black bg-[#ffc900] px-1 font-display text-[10px] font-bold">
                    {favoriteTools.length}
                </span>
            </div>
            <ul className="mt-0.5 space-y-1 px-1" role="list">
                {visibleEntries.map(({ toolId, tool }) => (
                    <li key={toolId}>
                        <SideNavFavoriteItem
                            label={tool.shortTitle}
                            icon={<StarIcon />}
                            active={activeToolId === toolId}
                            onClick={() => {
                                onSelectTool(toolId);
                                onNavigate?.();
                            }}
                        />
                    </li>
                ))}
            </ul>
            {hasMore ? (
                <button
                    type="button"
                    onClick={() => setExpanded((value) => !value)}
                    className="ms-focus ms-sidenav-btn mt-1 flex w-full items-center justify-center gap-1.5 px-2.5 py-1 font-display text-[11px] font-semibold text-[var(--color-ink-soft)]"
                    aria-expanded={expanded}
                >
                    {expanded ? 'Weniger anzeigen' : `Alle anzeigen (+${hiddenCount})`}
                    <svg
                        viewBox="0 0 24 24"
                        className={`h-3.5 w-3.5 transition ${expanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        aria-hidden
                    >
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </button>
            ) : null}
        </div>
    );
}
