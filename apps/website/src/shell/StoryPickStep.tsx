import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
    areas,
    stories,
    toolsForStory,
    type AreaId,
    type StoryId,
    type ToolDefinition,
    type UserStory,
} from '../data/catalog';
import { vorhabenPath } from '../routing/paths';
import { usePlatformNav } from '../routing/usePlatformNav';
import {
    filterToolsForStory,
    storiesForAreaFiltered,
    toolsForAreaDirectFiltered,
} from './filtering';
import { Icon } from './Icon';
import { AppPageHeader, PageContainer } from './PageContainer';
import { PickListSearch } from './PickListSearch';
import { SectionLabel } from './components/Primitives';

type StoryPickStepProps = {
    areaId: AreaId;
};

function firstSelectableTool(tools: readonly ToolDefinition[]): ToolDefinition | null {
    return tools[0] ?? null;
}

function firstSelectableStory(storyList: readonly UserStory[]): UserStory | null {
    return storyList.find((story) => story.status !== 'planned') ?? null;
}

export function StoryPickStep({ areaId }: StoryPickStepProps) {
    const { selectStory, selectTool } = usePlatformNav();
    const [query, setQuery] = useState('');
    const area = areas[areaId];
    const visibleStories = storiesForAreaFiltered(areaId, [], query);
    const directTools = toolsForAreaDirectFiltered(areaId, [], query);

    const selectedStory = useMemo(() => firstSelectableStory(visibleStories), [visibleStories]);
    const selectedTool = useMemo(() => firstSelectableTool(directTools), [directTools]);

    const submitSelection = useCallback(() => {
        if (selectedStory) {
            selectStory(selectedStory.id);
            return;
        }
        if (selectedTool) selectTool(selectedTool.id);
    }, [selectStory, selectTool, selectedStory, selectedTool]);

    const hasStories = visibleStories.length > 0;
    const hasDirectTools = directTools.length > 0;
    const emptyHint = query.trim()
        ? 'Kein Treffer — Suche anpassen.'
        : 'In diesem Bereich sind noch keine Einträge verfügbar.';

    return (
        <PageContainer wide>
            <AppPageHeader
                showBack
                title={area.label}
                subtitle="Vorhaben führen dich Schritt für Schritt. Direkte Tools öffnen sofort ein einzelnes Werkzeug."
                actions={
                    <span
                        className="inline-flex h-9 w-9 items-center justify-center rounded-[9px] border-2 border-black"
                        style={{ background: area.accent }}
                    >
                        <Icon svg={area.icon} size={20} />
                    </span>
                }
            >
                <Link
                    to={vorhabenPath(area.slug)}
                    className="ms-focus mt-2 inline-flex items-center gap-1 font-display text-[12px] font-semibold underline decoration-[var(--color-line)] underline-offset-2"
                >
                    Alle Vorhaben in {area.shortLabel}
                    <span aria-hidden>→</span>
                </Link>
            </AppPageHeader>

            <section className="max-w-[720px]">
                <div className="overflow-hidden rounded-[14px] border-2 border-black bg-white shadow-brutal">
                    <PickListSearch
                        attached
                        value={query}
                        onChange={setQuery}
                        onSubmit={submitSelection}
                        placeholder="Vorhaben oder Tool suchen …"
                    />

                    {!hasStories && !hasDirectTools ? (
                        <p className="border-t-2 border-black px-4 py-4 text-[15px] text-[var(--color-ink-soft)]">
                            {emptyHint}
                        </p>
                    ) : (
                        <>
                            {hasStories ? (
                                <div className="border-t-2 border-black">
                                    <SectionLabel className="px-4 py-2">Vorhaben</SectionLabel>
                                    <ul className="ms-stagger" role="listbox" aria-label="Vorhaben">
                                        {visibleStories.map((story, index) => (
                                            <li key={story.id} role="presentation">
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
                            ) : null}

                            {hasDirectTools ? (
                                <div className="border-t-2 border-black">
                                    <SectionLabel className="px-4 py-2">Direkt zum Tool</SectionLabel>
                                    <ul className="ms-stagger" role="listbox" aria-label="Tools">
                                        {directTools.map((tool, index) => (
                                            <li key={tool.id} role="presentation">
                                                <ToolListRow
                                                    tool={tool}
                                                    areaAccent={area.accent}
                                                    isLast={index === directTools.length - 1}
                                                    onSelect={() => selectTool(tool.id)}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </section>
        </PageContainer>
    );
}

function storyToolLabel(storyId: StoryId): string {
    const firstTool = toolsForStory(storyId)[0];
    return firstTool?.shortTitle ?? 'Geplant';
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
            role="option"
            onClick={onSelect}
            disabled={planned}
            className={`ms-focus pick-list-row flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
                isLast ? '' : 'border-b-2 border-black'
            } ${planned ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-[var(--row-accent)]'}`}
            style={
                {
                    ['--row-accent']: areaAccent,
                } as CSSProperties
            }
        >
            <span
                className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border-2 border-black font-display text-sm font-bold"
                style={{ background: areaAccent }}
            >
                {story.outcome.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[16px] font-semibold">
                    {story.outcome}
                </span>
                <span className="block truncate text-[13.5px] text-[var(--color-ink-soft)]">
                    {toolLabel}
                </span>
            </span>
            {planned ? (
                <span className="shrink-0 rounded-full border-2 border-black bg-[var(--color-chip)] px-2 py-0.5 font-display text-[11px] font-semibold">
                    Demnächst
                </span>
            ) : (
                <span className="shrink-0 rounded-full border-2 border-black bg-black px-2 py-0.5 font-display text-[11px] font-semibold text-white">
                    Vorhaben
                </span>
            )}
        </button>
    );
}

function ToolListRow({
    tool,
    areaAccent,
    isLast,
    onSelect,
}: {
    tool: ToolDefinition;
    areaAccent: string;
    isLast: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            role="option"
            onClick={onSelect}
            className={`ms-focus pick-list-row flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
                isLast ? '' : 'border-b-2 border-black'
            } cursor-pointer hover:bg-[var(--row-accent)]`}
            style={
                {
                    ['--row-accent']: areaAccent,
                } as CSSProperties
            }
        >
            <span
                className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border-2 border-black bg-white font-display text-sm font-bold"
                style={{ boxShadow: `inset 0 0 0 3px ${areaAccent}` }}
            >
                {tool.shortTitle.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[16px] font-semibold">
                    {tool.shortTitle}
                </span>
                <span className="block truncate text-[13.5px] text-[var(--color-ink-soft)]">
                    {tool.sub || 'Direkt zum Tool'}
                </span>
            </span>
            <span className="shrink-0 rounded-full border-2 border-black bg-black px-2 py-0.5 font-display text-[11px] font-semibold text-white">
                Tool
            </span>
        </button>
    );
}

export function ToolPickForStory({ storyId }: { storyId: StoryId }) {
    const { selectTool } = usePlatformNav();
    const [query, setQuery] = useState('');
    const story = stories[storyId];
    const storyTools = filterToolsForStory(storyId, [], query);
    const selectedTool = useMemo(() => firstSelectableTool(storyTools), [storyTools]);

    const submitSelection = useCallback(() => {
        if (selectedTool) selectTool(selectedTool.id);
    }, [selectTool, selectedTool]);

    if (!story) return null;

    return (
        <PageContainer>
            <AppPageHeader
                showBack
                title={
                    storyTools.length > 1
                        ? `Welches Tool passt für „${story.outcome}"?`
                        : story.outcome
                }
                subtitle={
                    storyTools.length > 1
                        ? 'Mehrere Tools gefunden — wähle das passende.'
                        : undefined
                }
            />

            <div className="max-w-[720px]">
                <div className="overflow-hidden rounded-[14px] border-2 border-black bg-white shadow-brutal">
                    <PickListSearch
                        attached
                        value={query}
                        onChange={setQuery}
                        onSubmit={submitSelection}
                        placeholder="Tool suchen …"
                    />
                    {storyTools.length === 0 ? (
                        <p className="border-t-2 border-black px-4 py-4 text-[15px] text-[var(--color-ink-soft)]">
                            Kein Tool gefunden — passe die Suche an.
                        </p>
                    ) : (
                        <ul
                            className="ms-stagger border-t-2 border-black grid gap-0"
                            role="listbox"
                            aria-label="Tools"
                        >
                            {storyTools.map((tool, index) => (
                                <li key={tool.id} role="presentation">
                                    <button
                                        type="button"
                                        role="option"
                                        onClick={() => selectTool(tool.id)}
                                        className={`ms-focus pick-list-row block w-full cursor-pointer px-5 py-4 text-left transition hover:bg-[var(--color-chip)] ${
                                            index < storyTools.length - 1
                                                ? 'border-b-2 border-black'
                                                : ''
                                        }`}
                                    >
                                        <span className="font-display text-[18px] font-bold tracking-[-0.01em]">
                                            {tool.shortTitle}
                                        </span>
                                        <span className="mt-1 block text-[14px] text-[var(--color-ink-soft)]">
                                            {tool.sub}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}
