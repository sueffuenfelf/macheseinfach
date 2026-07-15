import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { areaOrder, areas, getTool, toolsInArea } from '../data/catalog';
import { searchPath } from '../routing/paths';
import { usePlatformNav } from '../routing/usePlatformNav';
import { BrutalInput } from './components/Primitives';
import { Icon } from './Icon';

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
        <main className="mx-auto w-full max-w-[1040px] px-4 py-6 md:px-6 md:py-11">
            <h1 className="max-w-[16ch] font-display text-[34px] leading-[1.02] font-bold tracking-[-0.03em] text-[var(--color-ink)] sm:text-[44px]">
                Was willst du erledigen?
            </h1>
            <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-[var(--color-ink-soft)] sm:mt-4 sm:text-[17px]">
                Wähle erst deinen Bereich. Danach zeigen wir dir passende Situationen und öffnen das
                richtige Tool direkt.
            </p>

            <form
                className="mt-6 max-w-[520px]"
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
                        className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-[var(--color-ink-soft)]"
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
                        placeholder="Oder direkt suchen: HEIC, PDF verkleinern, IBAN …"
                        className="py-3 pr-3 pl-10"
                    />
                </div>
            </form>

            <ul className="ms-stagger mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                {areaOrder.map((id) => {
                    const area = areas[id];
                    const count = toolsInArea(id).length;
                    const planned = id === 'seo';
                    return (
                        <li key={id}>
                            <button
                                type="button"
                                onClick={() => selectArea(id)}
                                style={{ background: area.accent }}
                                className={`ms-focus ms-card ms-card-hover w-full cursor-pointer p-4 text-left sm:p-[22px] ${
                                    planned ? 'opacity-[0.82]' : ''
                                }`}
                            >
                                <span className="flex items-start justify-between gap-4">
                                    <span className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-[11px] border-2 border-black bg-white">
                                        <Icon svg={area.icon} size={24} />
                                    </span>
                                    {planned ? (
                                        <span className="ms-badge bg-black text-white">
                                            Geplant
                                        </span>
                                    ) : null}
                                </span>
                                <span className="mt-3 block font-display text-[21px] leading-tight font-bold tracking-[-0.02em] sm:mt-4 sm:text-[24px]">
                                    {area.label}
                                </span>
                                <span className="mt-2 block max-w-[34ch] text-[14.5px] leading-relaxed text-[var(--color-ink-soft)]">
                                    {area.description}
                                </span>
                                <span className="mt-5 flex items-center justify-between gap-3">
                                    <span className="rounded-full border-2 border-black bg-black px-3 py-1 font-display text-[12px] font-semibold text-white">
                                        {toolCountLabel(count, planned)}
                                    </span>
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.4"
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
                <section className="mt-10">
                    <h2 className="font-display text-[16px] font-semibold tracking-[-0.01em]">
                        Zuletzt genutzt
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2.5">
                        {recentTools.map((toolId) => {
                            const tool = getTool(toolId);
                            return (
                                <button
                                    key={tool.id}
                                    type="button"
                                    onClick={() => selectTool(tool.id)}
                                    className="ms-focus inline-flex items-center rounded-full border-2 border-black bg-white px-3 py-1.5 font-display text-[13px] font-semibold shadow-brutal-sm transition hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-brutal"
                                >
                                    {tool.shortTitle}
                                </button>
                            );
                        })}
                    </div>
                </section>
            ) : null}
        </main>
    );
}
