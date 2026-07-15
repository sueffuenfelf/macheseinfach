import { getTool, type ToolId } from '../data/catalog';
import { usePlatformNav } from '../routing/usePlatformNav';
import { BackButton } from './components/Primitives';

export function FavoritesPage() {
    const { favorites, goHome, selectTool, toggleFavorite, isFavorite } = usePlatformNav();

    const favoriteTools = favorites.map((id) => getTool(id));

    return (
        <main className="mx-auto w-full max-w-[1040px] px-4 py-6 md:px-6 md:py-11">
            <BackButton />

            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-[32px] leading-[1.02] font-bold tracking-[-0.03em] sm:text-[40px]">
                        Favoriten
                    </h1>
                    <p className="mt-2 max-w-[48ch] text-[15px] leading-relaxed text-[var(--color-ink-soft)] sm:text-[16px]">
                        Deine gemerkten Tools — ein Klick und du bist direkt im Werkzeug.
                    </p>
                </div>
                {favoriteTools.length > 0 ? (
                    <span className="rounded-full border-2 border-black bg-[#ffc900] px-3 py-1 font-display text-[13px] font-semibold shadow-brutal-sm">
                        {favoriteTools.length} {favoriteTools.length === 1 ? 'Tool' : 'Tools'}
                    </span>
                ) : null}
            </div>

            {favoriteTools.length === 0 ? (
                <div className="mt-10 rounded-[16px] border-2 border-black bg-white p-8 text-center shadow-brutal md:p-12">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-[12px] border-2 border-black bg-[var(--color-chip)]">
                        <svg
                            viewBox="0 0 24 24"
                            className="h-7 w-7"
                            fill="none"
                            stroke="black"
                            strokeWidth="2"
                        >
                            <path d="M12 3.8l2.68 5.43 5.99.87-4.33 4.22 1.02 5.96L12 17.43l-5.36 2.83 1.02-5.96-4.33-4.22 5.99-.87z" />
                        </svg>
                    </span>
                    <h2 className="mt-4 font-display text-[22px] font-bold tracking-[-0.02em]">
                        Noch keine Favoriten
                    </h2>
                    <p className="mx-auto mt-2 max-w-[40ch] text-[15px] text-[var(--color-ink-soft)]">
                        Markiere Tools mit dem Stern — sie erscheinen hier für schnellen Zugriff.
                    </p>
                    <button
                        type="button"
                        onClick={goHome}
                        className="ms-focus mt-6 inline-flex items-center gap-2 rounded-[10px] border-2 border-black bg-[#ff90e8] px-4 py-2.5 font-display text-[14px] font-semibold shadow-brutal transition hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg"
                    >
                        Bereiche entdecken
                    </button>
                </div>
            ) : (
                <ul className="ms-stagger mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </main>
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
        <article className="flex h-full flex-col rounded-[14px] border-2 border-black bg-white shadow-brutal transition hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg">
            <button
                type="button"
                onClick={onOpen}
                className="ms-focus flex flex-1 flex-col p-5 text-left"
            >
                <span className="font-display text-[20px] font-bold tracking-[-0.02em]">
                    {title}
                </span>
                <span className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-[var(--color-ink-soft)]">
                    {sub}
                </span>
                <span className="mt-4 inline-flex items-center gap-1.5 font-display text-[13px] font-semibold">
                    Tool öffnen
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                    >
                        <path d="M5 12h14" />
                        <path d="M13 6l6 6-6 6" />
                    </svg>
                </span>
            </button>
            <div className="flex items-center justify-between border-t-2 border-black px-4 py-2.5">
                <span className="font-mono text-[11px] text-[var(--color-ink-muted)]">
                    {toolId}
                </span>
                <button
                    type="button"
                    aria-label={starred ? 'Favorit entfernen' : 'Als Favorit markieren'}
                    aria-pressed={starred}
                    onClick={onToggleStar}
                    className="ms-focus inline-flex h-9 w-9 items-center justify-center rounded-[8px] border-2 border-black bg-[var(--color-chip)]"
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4.5 w-4.5"
                        fill={starred ? '#ffc900' : 'none'}
                        stroke="black"
                        strokeWidth="2"
                    >
                        <path d="M12 3.8l2.68 5.43 5.99.87-4.33 4.22 1.02 5.96L12 17.43l-5.36 2.83 1.02-5.96-4.33-4.22 5.99-.87z" />
                    </svg>
                </button>
            </div>
        </article>
    );
}
