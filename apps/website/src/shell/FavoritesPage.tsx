import { getTool, type ToolId } from '../data/catalog';
import { usePlatformNav } from '../routing/usePlatformNav';
import { AppPageHeader, PageContainer } from './PageContainer';

export function FavoritesPage() {
    const { favorites, goHome, selectTool, toggleFavorite, isFavorite } = usePlatformNav();

    const favoriteTools = favorites.map((id) => getTool(id));

    return (
        <PageContainer wide>
            <AppPageHeader
                title="Favoriten"
                subtitle="Deine gemerkten Tools — ein Klick und du bist direkt im Werkzeug."
                actions={
                    favoriteTools.length > 0 ? (
                        <span className="rounded-full border-2 border-black bg-[#ffc900] px-2.5 py-0.5 font-display text-[12px] font-semibold shadow-brutal-sm">
                            {favoriteTools.length} {favoriteTools.length === 1 ? 'Tool' : 'Tools'}
                        </span>
                    ) : null
                }
            />

            {favoriteTools.length === 0 ? (
                <div className="rounded-[12px] border-2 border-black bg-white p-6 text-center shadow-brutal md:p-8">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-[10px] border-2 border-black bg-[var(--color-chip)]">
                        <svg
                            viewBox="0 0 24 24"
                            className="h-6 w-6"
                            fill="none"
                            stroke="black"
                            strokeWidth="2"
                            aria-hidden
                        >
                            <path d="M12 3.8l2.68 5.43 5.99.87-4.33 4.22 1.02 5.96L12 17.43l-5.36 2.83 1.02-5.96-4.33-4.22 5.99-.87z" />
                        </svg>
                    </span>
                    <h2 className="mt-3 font-display text-[18px] font-bold tracking-[-0.02em]">
                        Noch keine Favoriten
                    </h2>
                    <p className="mx-auto mt-1.5 max-w-[40ch] text-[14px] text-[var(--color-ink-soft)]">
                        Markiere Tools mit dem Stern — sie erscheinen hier für schnellen Zugriff.
                    </p>
                    <button
                        type="button"
                        onClick={goHome}
                        className="ms-focus mt-4 inline-flex items-center gap-2 rounded-[8px] border-2 border-black bg-[#ff90e8] px-3.5 py-2 font-display text-[13px] font-semibold shadow-brutal transition hover:-translate-x-[1px] hover:-translate-y-[1px]"
                    >
                        Bereiche entdecken
                    </button>
                </div>
            ) : (
                <ul className="ms-stagger grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {favoriteTools.map((tool) => (
                        <li key={tool.id}>
                            <FavoriteToolCard
                                toolId={tool.id}
                                title={tool.shortTitle}
                                sub={tool.sub}
                                starred={isFavorite(tool.id)}
                                onOpen={() => selectTool(tool.id)}
                                onToggleStar={() => toggleFavorite(tool.id)}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </PageContainer>
    );
}

function FavoriteToolCard({
    toolId,
    title,
    sub,
    starred,
    onOpen,
    onToggleStar,
}: {
    toolId: ToolId;
    title: string;
    sub: string;
    starred: boolean;
    onOpen: () => void;
    onToggleStar: () => void;
}) {
    return (
        <article className="flex h-full flex-col rounded-[12px] border-2 border-black bg-white shadow-brutal transition hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-brutal-lg">
            <button
                type="button"
                onClick={onOpen}
                className="ms-focus flex flex-1 flex-col p-4 text-left"
            >
                <span className="font-display text-[17px] font-bold tracking-[-0.02em]">
                    {title}
                </span>
                <span className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[var(--color-ink-soft)]">
                    {sub}
                </span>
                <span className="mt-3 inline-flex items-center gap-1 font-display text-[12px] font-semibold">
                    Tool öffnen →
                </span>
            </button>
            <div className="flex items-center justify-between border-t-2 border-black px-3 py-2">
                <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">{toolId}</span>
                <button
                    type="button"
                    aria-label={starred ? 'Favorit entfernen' : 'Als Favorit markieren'}
                    aria-pressed={starred}
                    onClick={onToggleStar}
                    className="ms-focus inline-flex h-8 w-8 items-center justify-center rounded-[6px] border-2 border-black bg-[var(--color-chip)]"
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill={starred ? '#ffc900' : 'none'}
                        stroke="black"
                        strokeWidth="2"
                        aria-hidden
                    >
                        <path d="M12 3.8l2.68 5.43 5.99.87-4.33 4.22 1.02 5.96L12 17.43l-5.36 2.83 1.02-5.96-4.33-4.22 5.99-.87z" />
                    </svg>
                </button>
            </div>
        </article>
    );
}
