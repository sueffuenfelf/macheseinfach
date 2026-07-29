import { useMemo, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    areaOrder,
    areas,
    getAreaBySlug,
    stories,
    toolsForStory,
    type AreaId,
    type StoryId,
} from '../data/catalog';
import { parseVorhabenAreaParam, storyPath, vorhabenPath } from '../routing/paths';
import { PageHead } from '../seo/PageHead';
import { BrutalInput, SectionLabel } from './components/Primitives';
import { AppPageHeader, PageContainer } from './PageContainer';
import { filterVisibleStories } from './filtering';
import { Icon } from './Icon';

function storyAreaId(storyId: StoryId, preferred?: AreaId | null): AreaId {
    const story = stories[storyId];
    if (preferred && story.areaIds.includes(preferred)) return preferred;
    return story.areaIds[0]!;
}

export function StoriesOverviewPage() {
    const [searchParams] = useSearchParams();
    const areaSlug = parseVorhabenAreaParam(searchParams.toString());
    const areaFilter = getAreaBySlug(areaSlug)?.id ?? null;
    const [query, setQuery] = useState('');

    const allStories = useMemo(() => {
        const list = Object.values(stories).filter(
            (story) => story.status !== 'planned' || story.steps.length > 0,
        );
        if (!areaFilter) return list;
        return list.filter((story) => story.areaIds.includes(areaFilter));
    }, [areaFilter]);

    const visibleStories = useMemo(
        () => filterVisibleStories(allStories, [], query),
        [allStories, query],
    );

    const grouped = useMemo(() => {
        const map = new Map<AreaId, typeof visibleStories>();
        for (const story of visibleStories) {
            const areaId = storyAreaId(story.id, areaFilter);
            const bucket = map.get(areaId) ?? [];
            bucket.push(story);
            map.set(areaId, bucket);
        }
        const order = areaFilter ? [areaFilter] : areaOrder;
        return order
            .map((areaId) => ({ areaId, stories: map.get(areaId) ?? [] }))
            .filter((group) => group.stories.length > 0);
    }, [areaFilter, visibleStories]);

    return (
        <PageContainer wide className="py-4 md:py-5">
            <PageHead
                fallbackTitle="Vorhaben"
                description="Alle Multi-Tool-Vorhaben auf macheseinfach — Schritt für Schritt im Browser."
                canonicalPath={vorhabenPath(areaSlug || undefined)}
            />
            <AppPageHeader
                className="mb-3"
                title="Vorhaben"
                subtitle="Mehrschrittige Situationen mit passenden Tools — von der Checkliste bis zum Export."
            />

            <div className="mb-3 flex flex-wrap gap-2">
                <Link
                    to={vorhabenPath()}
                    className={`ms-focus rounded-full border-2 border-black px-3 py-1 font-display text-[12px] font-semibold ${
                        !areaFilter ? 'bg-[var(--color-accent)]' : 'bg-white'
                    }`}
                >
                    Alle Bereiche
                </Link>
                {areaOrder.map((areaId) => {
                    const area = areas[areaId];
                    const active = areaFilter === areaId;
                    return (
                        <Link
                            key={areaId}
                            to={vorhabenPath(area.slug)}
                            className={`ms-focus rounded-full border-2 border-black px-3 py-1 font-display text-[12px] font-semibold ${
                                active ? 'bg-[var(--color-accent)]' : 'bg-white'
                            }`}
                        >
                            {area.shortLabel}
                        </Link>
                    );
                })}
            </div>

            <div className="mb-4 max-w-[720px]">
                <label htmlFor="vorhaben-search" className="sr-only">
                    Vorhaben suchen
                </label>
                <BrutalInput
                    id="vorhaben-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Vorhaben suchen …"
                    className="py-3"
                />
            </div>

            {grouped.length === 0 ? (
                <p className="mt-6 text-[15px] text-[var(--color-ink-soft)]">
                    Kein Vorhaben gefunden — Suche oder Filter anpassen.
                </p>
            ) : (
                grouped.map(({ areaId, stories: areaStories }) => {
                    const area = areas[areaId];
                    return (
                        <section key={areaId} className="mt-6 first:mt-0">
                            <div className="flex items-center gap-2">
                                <span
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border-2 border-black"
                                    style={{ background: area.accent }}
                                >
                                    <Icon svg={area.icon} size={18} />
                                </span>
                                <SectionLabel>{area.label}</SectionLabel>
                            </div>
                            <div className="mt-3 overflow-hidden rounded-[14px] border-2 border-black bg-white shadow-brutal">
                                <ul className="divide-y-2 divide-black" role="list">
                                    {areaStories.map((story) => {
                                        const firstTool = toolsForStory(story.id)[0];
                                        const planned = story.status === 'planned';
                                        const rowClassName = `ms-focus flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
                                            planned
                                                ? 'cursor-not-allowed opacity-60'
                                                : 'hover:bg-[var(--row-accent)]'
                                        }`;
                                        const rowStyle = {
                                            ['--row-accent']: area.accent,
                                        } as CSSProperties;
                                        const rowContent = (
                                            <span className="min-w-0 flex-1">
                                                <span className="block font-display text-[16px] font-semibold">
                                                    {story.outcome}
                                                </span>
                                                <span className="mt-0.5 block text-[13px] text-[var(--color-ink-soft)]">
                                                    {firstTool?.shortTitle ?? story.situation}
                                                </span>
                                            </span>
                                        );
                                        return (
                                            <li key={story.id}>
                                                {planned ? (
                                                    <div
                                                        aria-disabled="true"
                                                        className={rowClassName}
                                                        style={rowStyle}
                                                    >
                                                        {rowContent}
                                                    </div>
                                                ) : (
                                                    <Link
                                                        to={storyPath(areaId, story.id)}
                                                        className={rowClassName}
                                                        style={rowStyle}
                                                    >
                                                        {rowContent}
                                                    </Link>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </section>
                    );
                })
            )}
        </PageContainer>
    );
}
