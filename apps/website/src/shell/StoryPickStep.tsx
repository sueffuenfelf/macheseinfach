import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import {
    areas,
    stories,
    toolsForStory,
    type AreaId,
    type StoryId,
    type ToolDefinition,
    type UserStory,
} from '../data/catalog';
import { usePlatformNav } from '../routing/usePlatformNav';
import {
    filterToolsForStory,
    storiesForAreaFiltered,
    toolsForAreaDirectFiltered,
} from './filtering';
import { Icon } from './Icon';
import { PickListSearch } from './PickListSearch';
import { BackButton, SectionLabel } from './components/Primitives';

type StoryPickStepProps = {
    areaId: AreaId;
};

type AreaPickEntry = { kind: 'story'; story: UserStory } | { kind: 'tool'; tool: ToolDefinition };

function firstSelectableTool(tools: readonly ToolDefinition[]): ToolDefinition | null {
    return tools[0] ?? null;
}

function firstSelectableEntry(entries: readonly AreaPickEntry[]): AreaPickEntry | null {
    return (
        entries.find((entry) => entry.kind === 'tool' || entry.story.status !== 'planned') ?? null
    );
}

export function StoryPickStep({ areaId }: StoryPickStepProps) {
    const { selectStory, selectTool } = usePlatformNav();
    const [query, setQuery] = useState('');
    const area = areas[areaId];
    const visibleStories = storiesForAreaFiltered(areaId, [], query);
    const directTools = toolsForAreaDirectFiltered(areaId, [], query);

    const entries = useMemo<AreaPickEntry[]>(() => {
        const storyEntries: AreaPickEntry[] = visibleStories.map((story) => ({
            kind: 'story',
            story,
        }));
        const toolEntries: AreaPickEntry[] = directTools.map((tool) => ({ kind: 'tool', tool }));
        return [...storyEntries, ...toolEntries];
    }, [visibleStories, directTools]);

    const selectedEntry = useMemo(() => firstSelectableEntry(entries), [entries]);

    const submitSelection = useCallback(() => {
        if (!selectedEntry) return;
        if (selectedEntry.kind === 'story') {
            selectStory(selectedEntry.story.id);
            return;
        }
        selectTool(selectedEntry.tool.id);
    }, [selectStory, selectTool, selectedEntry]);

    const hasStories = visibleStories.length > 0;
    const emptyHint = query.trim()
        ? 'Kein Vorhaben gefunden — Suche anpassen.'
        : 'In diesem Bereich sind noch keine Tools verfügbar.';

    return (
        <main className="mx-auto w-full max-w-[1040px] px-4 py-6 md:px-6 md:py-8">
            <BackButton />

            <div className="mt-4 flex items-center gap-3">
                <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border-2 border-black"
                    style={{ background: area.accent }}
                >
                    <Icon svg={area.icon} size={22} />
                </span>
                <h1 className="font-display text-[28px] leading-[1.05] font-bold tracking-[-0.02em] sm:text-[34px]">
                    {area.label}
                </h1>
            </div>
            <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-[var(--color-ink-soft)] sm:text-[16px]">
                {hasStories
                    ? 'Wähle dein Vorhaben. Wenn nur ein Tool passt, öffnen wir es direkt.'
                    : 'Wähle ein Tool — wir öffnen es direkt. Vorhaben-Karten folgen später.'}
            </p>

            <section className="mt-7 max-w-[720px]">
                <div className="overflow-hidden rounded-[14px] border-2 border-black bg-white shadow-brutal">
                    <PickListSearch
                        attached
                        value={query}
                        onChange={setQuery}
                        onSubmit={submitSelection}
                        placeholder={hasStories ? 'Vorhaben suchen …' : 'Tool suchen …'}
                    />
                    {entries.length === 0 ? (
                        <p className="border-t-2 border-black px-4 py-4 text-[15px] text-[var(--color-ink-soft)]">
                            {emptyHint}
                        </p>
                    ) : (
                        <ul
                            className="ms-stagger border-t-2 border-black"
                            role="listbox"
                            aria-label={hasStories ? 'Vorhaben und Tools' : 'Tools'}
                        >
                            {entries.map((entry, index) => (
                                <li
                                    key={
                                        entry.kind === 'story'
                                            ? entry.story.id
                                            : `tool:${entry.tool.id}`
                                    }
                                    role="presentation"
                                >
                                    {entry.kind === 'story' ? (
                                        <StoryListRow
                                            story={entry.story}
                                            areaAccent={area.accent}
                                            isLast={index === entries.length - 1}
                                            isSelected={
                                                selectedEntry?.kind === 'story' &&
                                                selectedEntry.story.id === entry.story.id
                                            }
                                            onSelect={() => selectStory(entry.story.id)}
                                        />
                                    ) : (
                                        <ToolListRow
                                            tool={entry.tool}
                                            areaAccent={area.accent}
                                            isLast={index === entries.length - 1}
                                            isSelected={
                                                selectedEntry?.kind === 'tool' &&
                                                selectedEntry.tool.id === entry.tool.id
                                            }
                                            onSelect={() => selectTool(entry.tool.id)}
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {selectedEntry ? (
                    <p className="mt-2 text-[12px] text-[var(--color-ink-soft)]">
                        <kbd className="rounded border border-black/30 bg-white px-1.5 py-0.5 font-mono text-[11px]">
                            Enter
                        </kbd>{' '}
                        öffnet „
                        {selectedEntry.kind === 'story'
                            ? selectedEntry.story.outcome
                            : selectedEntry.tool.shortTitle}
                        “
                    </p>
                ) : null}
            </section>
        </main>
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
    isSelected,
    onSelect,
}: {
    story: UserStory;
    areaAccent: string;
    isLast: boolean;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const planned = story.status === 'planned';
    const toolLabel = storyToolLabel(story.id);

    return (
        <button
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={onSelect}
            disabled={planned}
            className={`ms-focus pick-list-row flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
                isLast ? '' : 'border-b-2 border-black'
            } ${planned ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${
                isSelected && !planned ? 'pick-list-row--selected' : ''
            } ${!planned && !isSelected ? 'hover:bg-[var(--row-accent)]' : ''}`}
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
            ) : null}
        </button>
    );
}

function ToolListRow({
    tool,
    areaAccent,
    isLast,
    isSelected,
    onSelect,
}: {
    tool: ToolDefinition;
    areaAccent: string;
    isLast: boolean;
    isSelected: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={onSelect}
            className={`ms-focus pick-list-row flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
                isLast ? '' : 'border-b-2 border-black'
            } cursor-pointer ${isSelected ? 'pick-list-row--selected' : 'hover:bg-[var(--row-accent)]'}`}
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
        <main className="mx-auto w-full max-w-[1040px] px-4 py-6 md:px-6 md:py-8">
            <BackButton />

            <SectionLabel className="mt-6">
                {storyTools.length > 1 ? 'Mehrere Tools gefunden' : 'Tool für dieses Vorhaben'}
            </SectionLabel>
            <h2 className="mt-2 max-w-[48ch] font-display text-[23px] leading-tight font-bold tracking-[-0.02em] sm:text-[28px]">
                {storyTools.length > 1
                    ? `Welches Tool passt für „${story.outcome}"?`
                    : story.outcome}
            </h2>

            <div className="mt-5 max-w-[720px]">
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
                                        aria-selected={selectedTool?.id === tool.id}
                                        onClick={() => selectTool(tool.id)}
                                        className={`ms-focus pick-list-row block w-full cursor-pointer px-5 py-4 text-left transition ${
                                            index < storyTools.length - 1
                                                ? 'border-b-2 border-black'
                                                : ''
                                        } ${selectedTool?.id === tool.id ? 'pick-list-row--selected' : 'hover:bg-[var(--color-chip)]'}`}
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
                {selectedTool ? (
                    <p className="mt-2 text-[12px] text-[var(--color-ink-soft)]">
                        <kbd className="rounded border border-black/30 bg-white px-1.5 py-0.5 font-mono text-[11px]">
                            Enter
                        </kbd>{' '}
                        öffnet „{selectedTool.shortTitle}“
                    </p>
                ) : null}
            </div>
        </main>
    );
}
