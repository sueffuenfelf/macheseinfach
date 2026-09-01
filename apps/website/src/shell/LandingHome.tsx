import type { AreaDefinition, AreaId, ToolDefinition, ToolId } from '../data/catalog';
import { areaCardTextColors } from './areaCardText';
import { BrutalInput, SectionLabel } from './components/Primitives';
import { Icon } from './Icon';
import { AppPageHeader, PageContainer } from './PageContainer';

export type LandingHomeProps = {
    query: string;
    onQueryChange: (value: string) => void;
    onSubmit: () => void;
    areas: readonly AreaDefinition[];
    tools: readonly ToolDefinition[];
    recentTools: readonly ToolDefinition[];
    onSelectArea: (areaId: AreaId) => void;
    onSelectTool: (toolId: ToolId) => void;
};

function SearchGlyph() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[var(--color-ink-soft)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden
        >
            <title>Suche</title>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
        </svg>
    );
}

export function LandingHome({
    query,
    onQueryChange,
    onSubmit,
    areas,
    tools,
    recentTools,
    onSelectArea,
    onSelectTool,
}: LandingHomeProps) {
    const hasQuery = query.trim().length > 0;
    const emptyMatch =
        hasQuery && areas.length === 0 && tools.length === 0 && recentTools.length === 0;

    return (
        <PageContainer wide className="py-6 md:py-10">
            <AppPageHeader
                className="mb-4 border-0 pb-0"
                title="Finde das passende Tool"
                subtitle="Tippe ein Stichwort. Bereiche und Tools erscheinen direkt darunter."
            />

            <search className="mb-5">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmit();
                    }}
                >
                    <label htmlFor="home-search" className="sr-only">
                        Tools und Bereiche suchen
                    </label>
                    <div className="relative">
                        <SearchGlyph />
                        <BrutalInput
                            id="home-search"
                            type="search"
                            autoFocus
                            autoComplete="off"
                            spellCheck={false}
                            value={query}
                            onChange={(event) => onQueryChange(event.target.value)}
                            placeholder="PDF verkleinern, HEIC, Länge, JSON …"
                            className="py-4 pr-4 pl-12 text-[16px] md:text-[18px]"
                        />
                    </div>
                </form>
            </search>

            <section aria-label="Bereiche" className="mb-6">
                <SectionLabel>{hasQuery ? 'Passende Bereiche' : 'Bereiche'}</SectionLabel>
                {areas.length === 0 ? (
                    <p className="mt-3 text-[14px] text-[var(--color-ink-muted)]">
                        Kein Bereich trifft zu.
                    </p>
                ) : (
                    <ul className="mt-3 flex flex-wrap gap-2">
                        {areas.map((area) => {
                            const textColors = areaCardTextColors(area.accent);
                            return (
                                <li key={area.id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelectArea(area.id)}
                                        aria-label={`Bereich ${area.label}`}
                                        style={{
                                            background: area.accent,
                                            color: textColors.title,
                                        }}
                                        className="ms-focus ms-card-hover inline-flex items-center gap-2 rounded-[12px] border-2 border-black px-3 py-2 text-left font-display text-[14px] font-bold shadow-brutal-sm"
                                    >
                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] border-2 border-black bg-white">
                                            <Icon svg={area.icon} size={16} />
                                        </span>
                                        {area.shortLabel}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            {hasQuery ? (
                <section aria-live="polite" aria-label="Passende Tools">
                    <SectionLabel>
                        {tools.length === 1 ? '1 Tool' : `${tools.length} Tools`}
                    </SectionLabel>
                    {emptyMatch ? (
                        <p className="mt-3 text-[14px] text-[var(--color-ink-muted)]">
                            Nichts gefunden. Anderes Stichwort oder einen Bereich oben wählen.
                        </p>
                    ) : tools.length === 0 ? (
                        <p className="mt-3 text-[14px] text-[var(--color-ink-muted)]">
                            Kein Tool zu diesem Stichwort. Bereich oben öffnen oder weitertippen.
                        </p>
                    ) : (
                        <ul className="mt-3 space-y-2">
                            {tools.map((tool) => (
                                <li key={tool.id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelectTool(tool.id)}
                                        className="ms-focus ms-card ms-card-hover w-full p-3 text-left"
                                    >
                                        <span className="block font-display text-[15px] font-bold tracking-[-0.01em]">
                                            {tool.shortTitle}
                                        </span>
                                        <span className="mt-0.5 block text-[13px] text-[var(--color-ink-soft)]">
                                            {tool.sub}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            ) : recentTools.length > 0 ? (
                <section aria-label="Zuletzt genutzt">
                    <SectionLabel>Zuletzt genutzt</SectionLabel>
                    <ul className="mt-3 flex flex-wrap gap-2">
                        {recentTools.map((tool) => (
                            <li key={tool.id}>
                                <button
                                    type="button"
                                    onClick={() => onSelectTool(tool.id)}
                                    className="ms-focus inline-flex items-center rounded-full border-2 border-black bg-white px-2.5 py-1 font-display text-[12px] font-semibold shadow-brutal-sm transition hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-brutal"
                                >
                                    {tool.shortTitle}
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </PageContainer>
    );
}
