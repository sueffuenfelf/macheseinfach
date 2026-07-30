import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { areaOrder, areas, getTool, toolsInArea } from '../data/catalog';
import { searchPath, vorhabenPath } from '../routing/paths';
import { usePlatformNav } from '../routing/usePlatformNav';
import { areaCardTextColors } from './areaCardText';
import { BrutalInput } from './components/Primitives';
import { Icon } from './Icon';
import { AppPageHeader, PageContainer } from './PageContainer';

function toolCountLabel(count: number, planned: boolean): string {
    if (planned) return `${count} Tools geplant`;
    if (count === 1) return '1 Tool';
    return `${count} Tools`;
}

export function AreaStep() {
    const { selectArea, selectTool, recentTools, activeAreaId } = usePlatformNav();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const showRecent = !activeAreaId && recentTools.length > 0;

    return (
        <PageContainer wide className="py-4 md:py-5">
            <AppPageHeader
                className="mb-3"
                title="Was willst du erledigen?"
                subtitle={
                    <>
                        Wähle einen Bereich — oder starte mit{' '}
                        <Link
                            to={vorhabenPath()}
                            className="ms-focus font-semibold text-[var(--color-ink)] underline decoration-[var(--color-line)] underline-offset-2"
                        >
                            allen Vorhaben
                        </Link>
                        .
                    </>
                }
            />

            <form
                className="mb-3 max-w-[480px]"
                onSubmit={(e) => {
                    e.preventDefault();
                    navigate(searchPath(searchQuery));
                }}
            >
                <label htmlFor="home-search" className="sr-only">
                    Globale Suche
                </label>
                <div className="relative">
                    <svg
                        viewBox="0 0 24 24"
                        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-soft)]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        aria-hidden
                    >
                        <circle cx="11" cy="11" r="7" />
                        <path d="M20 20l-4-4" />
                    </svg>
                    <BrutalInput
                        id="home-search"
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Direkt suchen: HEIC, PDF, IBAN …"
                        className="py-2.5 pr-3 pl-9 text-[14px]"
                    />
                </div>
            </form>

            <ul className="ms-stagger grid grid-cols-1 items-stretch gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {areaOrder.map((id) => {
                    const area = areas[id];
                    const areaTools = toolsInArea(id);
                    const liveCount = areaTools.filter((t) => t.maturity !== 'planned').length;
                    const planned = liveCount === 0 && areaTools.length > 0;
                    const count = planned ? areaTools.length : liveCount;
                    const textColors = areaCardTextColors(area.accent);
                    return (
                        <li key={id} className="h-full">
                            <button
                                type="button"
                                onClick={() => selectArea(id)}
                                style={{
                                    background: area.accent,
                                    color: textColors.title,
                                }}
                                className={`ms-focus ms-card ms-card-hover flex h-full w-full cursor-pointer flex-col p-3 text-left ${
                                    planned ? 'opacity-[0.82]' : ''
                                }`}
                            >
                                <span className="flex items-start justify-between gap-3">
                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-[9px] border-2 border-black bg-white">
                                        <Icon svg={area.icon} size={20} />
                                    </span>
                                    {planned ? (
                                        <span className="ms-badge bg-black text-white text-[10px]">
                                            Geplant
                                        </span>
                                    ) : null}
                                </span>
                                <span className="mt-2.5 block font-display text-[17px] leading-tight font-bold tracking-[-0.02em]">
                                    {area.label}
                                </span>
                                <span
                                    className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed"
                                    style={{ color: textColors.description }}
                                >
                                    {area.description}
                                </span>
                                <span className="mt-auto flex items-center justify-between gap-2 pt-3">
                                    <span className="rounded-full border-2 border-black bg-black px-2.5 py-0.5 font-display text-[11px] font-semibold text-white">
                                        {toolCountLabel(count, planned)}
                                    </span>
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.4"
                                        aria-hidden
                                    >
                                        <path d="M5 12h14" />
                                        <path d="M13 6l6 6-6 6" />
                                    </svg>
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>

            {showRecent ? (
                <section className="mt-8">
                    <h2 className="font-display text-[13px] font-semibold tracking-[-0.01em] text-[var(--color-ink-muted)]">
                        Zuletzt genutzt
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {recentTools.map((toolId) => {
                            const tool = getTool(toolId);
                            return (
                                <button
                                    key={tool.id}
                                    type="button"
                                    onClick={() => selectTool(tool.id)}
                                    className="ms-focus inline-flex items-center rounded-full border-2 border-black bg-white px-2.5 py-1 font-display text-[12px] font-semibold shadow-brutal-sm transition hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-brutal"
                                >
                                    {tool.shortTitle}
                                </button>
                            );
                        })}
                    </div>
                </section>
            ) : null}
        </PageContainer>
    );
}
