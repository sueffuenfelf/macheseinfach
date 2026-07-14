import { areas, stories, toolsForStory, type AreaId, type StoryId, type UserStory } from '../data/catalog';
import { usePlatformNav } from '../routing/usePlatformNav';
import { filterToolsForStory, storiesForAreaFiltered } from './filtering';
import { Icon } from './Icon';
import { TagFilter } from './TagFilter';
import { BackButton, SectionLabel } from './components/Primitives';

const VIEW_OPTIONS = [
    ['grid', 'Kacheln'],
    ['cards', 'Karten'],
    ['list', 'Liste'],
] as const;

type StoryPickStepProps = {
    areaId: AreaId;
};

export function StoryPickStep({ areaId }: StoryPickStepProps) {
    const { selectStory, variant, setVariant, activeTags } = usePlatformNav();
    const area = areas[areaId];
    const visibleStories = storiesForAreaFiltered(areaId, activeTags, '');

    return (
        <main className="mx-auto w-full max-w-[1040px] px-4 py-8 md:px-6">
            <BackButton />

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
                Wähle die Situation, die zu deinem Vorhaben passt. Wenn nur ein Tool passt, öffnen wir es direkt.
            </p>

            <TagFilter embedded />

            <div className="mt-8">
                <SectionLabel>Ansicht der Situations-Auswahl</SectionLabel>
                <div className="mt-2 inline-flex overflow-hidden rounded-[10px] border-2 border-black bg-white shadow-[3px_3px_0_#000]">
                    {VIEW_OPTIONS.map(([value, label], index, all) => (
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

            {visibleStories.length === 0 ? (
                <p className="mt-7 text-[15px] text-[var(--color-ink-soft)]">
                    Keine Situation passt zu deinem Filter — wähle andere Tags oben.
                </p>
            ) : variant === 'grid' ? (
                <ul className="ms-stagger mt-7 grid max-w-[800px] grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
                    {visibleStories.map((story) => (
                        <li key={story.id}>
                            <StoryGridTile story={story} area={area} onSelect={() => selectStory(story.id)} />
                        </li>
                    ))}
                </ul>
            ) : variant === 'cards' ? (
                <ul className="ms-stagger mt-7 flex max-w-[760px] flex-col gap-3.5">
                    {visibleStories.map((story) => (
                        <li key={story.id}>
                            <StoryOutcomeCard story={story} areaAccent={area.accent} onSelect={() => selectStory(story.id)} />
                        </li>
                    ))}
                </ul>
            ) : (
                <section className="mt-7 max-w-[720px]">
                    <div className="overflow-hidden rounded-[14px] border-2 border-black bg-white shadow-brutal">
                        <ul className="ms-stagger">
                            {visibleStories.map((story, index) => (
                                <li key={story.id}>
                                    <StoryListRow
                                        story={story}
                                        areaAccent={area.accent}
                                        isLast={index === visibleStories.length - 1}
                                        onSelect={() => selectStory(story.id)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}
        </main>
    );
}

function storyToolLabel(storyId: StoryId): string {
    const firstTool = toolsForStory(storyId)[0];
    return firstTool?.shortTitle ?? 'Geplant';
}

function StoryGridTile({
    story,
    area,
    onSelect,
}: {
    story: UserStory;
    area: (typeof areas)[AreaId];
    onSelect: () => void;
}) {
    const planned = story.status === 'planned';
    const toolLabel = storyToolLabel(story.id);

    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={planned}
            className={`ms-focus flex min-h-[150px] w-full cursor-pointer flex-col rounded-[14px] border-2 border-black p-[18px] text-left shadow-brutal transition hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#000] ${
                planned ? 'cursor-not-allowed opacity-65' : ''
            }`}
            style={{ background: area.accent }}
        >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border-2 border-black bg-white">
                <Icon svg={area.icon} size={20} />
            </span>
            <span className="mt-3 font-display text-[17px] leading-snug font-bold">{story.outcome}</span>
            <span className="mt-auto font-display text-[12px] font-semibold text-[var(--color-ink-soft)]">{toolLabel}</span>
        </button>
    );
}

function StoryOutcomeCard({
    story,
    areaAccent,
    onSelect,
}: {
    story: UserStory;
    areaAccent: string;
    onSelect: () => void;
}) {
    const planned = story.status === 'planned';
    const toolLabel = storyToolLabel(story.id);

    return (
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
                    <span className="font-display text-[19px] leading-[1.3] font-semibold tracking-[-0.01em]">
                        {story.outcome}
                    </span>
                    <span className="mt-1.5 block text-[14px] text-[var(--color-ink-soft)]">{toolLabel}</span>
                    {planned ? (
                        <span className="mt-2 inline-flex rounded-full border-2 border-black bg-[var(--color-chip)] px-2.5 py-1 font-display text-[11px] font-semibold">
                            Demnächst
                        </span>
                    ) : null}
                </span>
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M7 12h10" />
                        <path d="M13 6l6 6-6 6" />
                    </svg>
                </span>
            </span>
        </button>
    );
}

function StoryListRow({
    story,
    areaAccent,
    isLast,
    onSelect,
}: {
    story: UserStory;
    areaAccent: string;
    isLast: boolean;
    onSelect: () => void;
}) {
    const planned = story.status === 'planned';
    const toolLabel = storyToolLabel(story.id);

    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={planned}
            className={`ms-focus flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
                isLast ? '' : 'border-b-2 border-black'
            } ${planned ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-[var(--row-accent)]'}`}
            style={{ ['--row-accent' as const]: areaAccent }}
        >
            <span
                className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border-2 border-black font-display text-sm font-bold"
                style={{ background: areaAccent }}
            >
                {story.outcome.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[16px] font-semibold">{story.outcome}</span>
                <span className="block truncate text-[13.5px] text-[var(--color-ink-soft)]">{toolLabel}</span>
            </span>
            {planned ? (
                <span className="shrink-0 rounded-full border-2 border-black bg-[var(--color-chip)] px-2 py-0.5 font-display text-[11px] font-semibold">
                    Demnächst
                </span>
            ) : null}
        </button>
    );
}

export function ToolPickForStory({ storyId }: { storyId: StoryId }) {
    const { selectTool, activeTags } = usePlatformNav();
    const story = stories[storyId];
    const storyTools = filterToolsForStory(storyId, activeTags, '');

    if (!story) return null;

    return (
        <main className="mx-auto w-full max-w-[1040px] px-4 py-8 md:px-6">
            <BackButton />

            <div className="mt-4">
                <TagFilter embedded />
            </div>

            {storyTools.length === 0 ? (
                <p className="mt-6 text-[15px] text-[var(--color-ink-soft)]">
                    Kein Tool passt zu deinem Filter — wähle andere Tags oben.
                </p>
            ) : (
                <>
                    <SectionLabel className="mt-6">
                        {storyTools.length > 1 ? 'Mehrere Tools gefunden' : 'Tool für diese Situation'}
                    </SectionLabel>
                    <h2 className="mt-2 max-w-[48ch] font-display text-[28px] leading-tight font-bold tracking-[-0.02em]">
                        {storyTools.length > 1
                            ? `Welches Tool passt für „${story.outcome}"?`
                            : story.outcome}
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
                </>
            )}
        </main>
    );
}
