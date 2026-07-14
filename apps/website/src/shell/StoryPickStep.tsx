import { areas, stories, storiesInArea, toolsForStory, type AreaId, type StoryId } from '../data/catalog';
import { usePlatform } from '../context/PlatformContext';
import { Icon } from './Icon';
import { SectionLabel } from './components/Primitives';

type StoryPickStepProps = {
    areaId: AreaId;
};

export function StoryPickStep({ areaId }: StoryPickStepProps) {
    const { selectStory, variant, setVariant, query, setQuery, goHome } = usePlatform();
    const area = areas[areaId];
    const areaStories = storiesInArea(areaId).filter((story) => story.areaIds.includes(areaId));

    const searchNeedles = ['PDF kleiner', 'IBAN prüfen', 'HEIC umwandeln', 'schwärzen', 'unterschreiben'];
    const normalizedQuery = query.trim().toLowerCase();

    const searchedStories =
        normalizedQuery.length === 0
            ? areaStories
            : areaStories.filter((story) => {
                  const firstTool = toolsForStory(story.id)[0];
                  const toolTag = firstTool?.shortTitle ?? 'geplant';
                  const haystack = `${story.role} ${story.want} ${story.outcome} ${toolTag}`.toLowerCase();
                  return haystack.includes(normalizedQuery);
              });

    return (
        <main className="mx-auto w-full max-w-[1040px] px-4 py-8 md:px-6">
            <button
                type="button"
                onClick={goHome}
                className="ms-focus inline-flex items-center gap-2 font-display text-[14px] font-bold hover:underline"
            >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M15 5l-7 7 7 7" />
                </svg>
                Zurück zu den Bereichen
            </button>

            <div className="mt-4 flex items-center gap-3">
                <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border-2 border-black"
                    style={{ background: area.accent }}
                >
                    <Icon svg={area.icon} size={22} />
                </span>
                <h1 className="font-display text-[34px] leading-[1.05] font-bold tracking-[-0.02em]">{area.label}</h1>
            </div>
            <p className="mt-3 max-w-[62ch] text-[16px] leading-relaxed text-[var(--color-ink-soft)]">
                Sag in normaler Sprache, was du vorhast. Wenn nur ein Tool passt, öffnen wir es direkt.
            </p>

            <div className="mt-8">
                <SectionLabel>Ansicht der Situations-Auswahl</SectionLabel>
                <div className="mt-2 inline-flex overflow-hidden rounded-[10px] border-2 border-black bg-white shadow-[3px_3px_0_#000]">
                    {([
                        ['sentences', 'Sätze'],
                        ['search', 'Suche'],
                        ['tiles', 'Kacheln'],
                    ] as const).map(([value, label], index, all) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setVariant(value)}
                            className={`ms-focus px-4 py-2.5 font-display text-[13px] font-semibold transition ${
                                variant === value ? 'bg-black text-white' : 'bg-white text-black hover:bg-[var(--color-chip)]'
                            } ${index < all.length - 1 ? 'border-r-2 border-black' : ''}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {variant === 'sentences' ? (
                <ul className="ms-stagger mt-7 flex max-w-[760px] flex-col gap-3.5">
                    {areaStories.map((story) => (
                        <SentenceCard
                            key={story.id}
                            areaAccent={area.accent}
                            storyId={story.id}
                            onSelect={() => selectStory(story.id)}
                        />
                    ))}
                </ul>
            ) : null}

            {variant === 'search' ? (
                <section className="mt-7 max-w-[720px]">
                    <div className="relative">
                        <svg
                            viewBox="0 0 24 24"
                            className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[var(--color-ink-soft)]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path d="M20 20l-4-4" />
                        </svg>
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Was willst du tun? z.B. „PDF kleiner machen“"
                            className="ms-input ms-focus rounded-[12px] py-4 pr-4 pl-[46px] text-[17px] shadow-brutal"
                        />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {searchNeedles.map((needle) => (
                            <button
                                key={needle}
                                type="button"
                                onClick={() => setQuery(needle)}
                                className="ms-focus rounded-full border-2 border-black bg-[var(--color-chip)] px-3 py-1.5 font-display text-[13px] font-semibold shadow-brutal-sm transition hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-brutal"
                            >
                                {needle}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 overflow-hidden rounded-[14px] border-2 border-black bg-white shadow-brutal">
                        {searchedStories.length ? (
                            <ul className="ms-stagger">
                                {searchedStories.map((story, index) => {
                                    const firstTool = toolsForStory(story.id)[0];
                                    const toolTag = firstTool?.shortTitle ?? 'geplant';
                                    return (
                                        <li key={story.id}>
                                            <button
                                                type="button"
                                                onClick={() => selectStory(story.id)}
                                                disabled={story.status === 'planned'}
                                                className={`ms-focus flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
                                                    index < searchedStories.length - 1 ? 'border-b-2 border-black' : ''
                                                } ${
                                                    story.status === 'planned'
                                                        ? 'cursor-not-allowed opacity-60'
                                                        : 'cursor-pointer hover:bg-[var(--row-accent)]'
                                                }`}
                                                style={{ ['--row-accent' as const]: area.accent }}
                                            >
                                                <span
                                                    className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border-2 border-black font-display text-sm font-bold"
                                                    style={{ background: area.accent }}
                                                >
                                                    {story.outcome.charAt(0).toUpperCase()}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate font-display text-[16px] font-semibold">
                                                        {story.outcome}
                                                    </span>
                                                    <span className="block truncate text-[13.5px] text-[var(--color-ink-soft)]">
                                                        {story.role} {story.want}
                                                    </span>
                                                </span>
                                                <span className="font-display text-[12px] font-semibold text-[var(--color-ink-muted)]">
                                                    {toolTag}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="p-5 text-[14px] text-[var(--color-ink-soft)]">
                                Nichts gefunden — probier ein anderes Stichwort oder wechsle zur Ansicht „Sätze“.
                            </p>
                        )}
                    </div>
                </section>
            ) : null}

            {variant === 'tiles' ? (
                <ul className="ms-stagger mt-7 grid max-w-[800px] grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
                    {areaStories.map((story) => (
                        <li key={story.id}>
                            <button
                                type="button"
                                onClick={() => selectStory(story.id)}
                                disabled={story.status === 'planned'}
                                className={`ms-focus flex min-h-[150px] w-full cursor-pointer flex-col rounded-[14px] border-2 border-black p-[18px] text-left shadow-brutal transition hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#000] ${
                                    story.status === 'planned' ? 'cursor-not-allowed opacity-65' : ''
                                }`}
                                style={{ background: area.accent }}
                            >
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border-2 border-black bg-white">
                                    <Icon svg={area.icon} size={20} />
                                </span>
                                <span className="mt-3 font-display text-[17px] leading-snug font-bold">{story.outcome}</span>
                                <span className="mt-auto text-[13px] text-[var(--color-ink-soft)]">
                                    {story.role} {story.want}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}
        </main>
    );
}

function SentenceCard({ storyId, areaAccent, onSelect }: { storyId: StoryId; areaAccent: string; onSelect: () => void }) {
    const story = stories[storyId];
    if (!story) return null;
    const planned = story.status === 'planned';

    return (
        <li>
            <button
                type="button"
                onClick={onSelect}
                disabled={planned}
                className={`ms-focus flex w-full items-stretch overflow-hidden rounded-[14px] border-2 border-black bg-white text-left shadow-brutal transition ${
                    planned
                        ? 'cursor-not-allowed opacity-60'
                        : 'cursor-pointer hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#000]'
                }`}
            >
                <span className="w-2 shrink-0 border-r-2 border-black" style={{ background: areaAccent }} />
                <span className="flex min-w-0 flex-1 items-center justify-between gap-4 px-5 py-4">
                    <span className="min-w-0">
                        <span
                            className="inline-flex rounded-full border-[1.5px] border-black px-2.5 py-1 font-display text-[11.5px] font-semibold"
                            style={{ background: areaAccent }}
                        >
                            {story.role}
                        </span>
                        <span className="mt-2 block font-display text-[19px] leading-[1.3] font-semibold tracking-[-0.01em]">
                            {story.want}
                        </span>
                        <span className="mt-1 block text-[14px] text-[var(--color-ink-soft)]">→ {story.outcome}</span>
                        {planned ? (
                            <span className="mt-2 inline-flex rounded-full border-2 border-black bg-[var(--color-chip)] px-2.5 py-1 font-display text-[11px] font-semibold">
                                Demnächst
                            </span>
                        ) : null}
                    </span>
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center">
                        <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                        >
                            <path d="M7 12h10" />
                            <path d="M13 6l6 6-6 6" />
                        </svg>
                    </span>
                </span>
            </button>
        </li>
    );
}

export function ToolPickForStory({ storyId }: { storyId: StoryId }) {
    const { selectTool } = usePlatform();
    const story = stories[storyId];
    const storyTools = toolsForStory(storyId);

    if (storyTools.length <= 1 || !story) return null;

    return (
        <main className="mx-auto w-full max-w-[1040px] px-4 py-8 md:px-6">
            <SectionLabel>Mehrere Tools gefunden</SectionLabel>
            <h2 className="mt-2 max-w-[48ch] font-display text-[28px] leading-tight font-bold tracking-[-0.02em]">
                Welches Tool passt für „{story.outcome}“?
            </h2>
            <ul className="ms-stagger mt-5 grid gap-3">
                {storyTools.map((t) => (
                    <li key={t.id}>
                        <button
                            type="button"
                            onClick={() => selectTool(t.id)}
                            className="ms-focus ms-card ms-card-hover w-full cursor-pointer rounded-[14px] px-5 py-4 text-left"
                        >
                            <span className="font-display text-[18px] font-bold tracking-[-0.01em]">{t.shortTitle}</span>
                            <span className="mt-1 block text-[14px] text-[var(--color-ink-soft)]">{t.sub}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </main>
    );
}
