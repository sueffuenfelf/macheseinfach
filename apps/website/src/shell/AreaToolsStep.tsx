import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import {
    areas,
    toolsInArea,
    type AreaId,
    type ToolDefinition,
} from '../data/catalog';
import { conversionHubPath } from '../routing/paths';
import { usePlatformNav } from '../routing/usePlatformNav';
import { toolMatchesQuery, toolMatchesTags } from './filtering';
import { Icon } from './Icon';
import { AppPageHeader, PageContainer } from './PageContainer';
import { PickListSearch } from './PickListSearch';
import { Link } from 'react-router-dom';

type AreaToolsStepProps = {
    areaId: AreaId;
};

function firstSelectableTool(tools: readonly ToolDefinition[]): ToolDefinition | null {
    return tools[0] ?? null;
}

export function AreaToolsStep({ areaId }: AreaToolsStepProps) {
    const { selectTool } = usePlatformNav();
    const [query, setQuery] = useState('');
    const area = areas[areaId];
    const visibleTools = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return toolsInArea(areaId).filter((tool) => {
            if (!toolMatchesTags(tool, [])) return false;
            if (!normalizedQuery) return true;
            return toolMatchesQuery(tool, normalizedQuery);
        });
    }, [areaId, query]);

    const selectedTool = useMemo(() => firstSelectableTool(visibleTools), [visibleTools]);

    const submitSelection = useCallback(() => {
        if (selectedTool) selectTool(selectedTool.id);
    }, [selectTool, selectedTool]);

    const emptyHint = query.trim()
        ? 'Kein Treffer — Suche anpassen.'
        : 'In diesem Bereich sind noch keine Einträge verfügbar.';

    return (
        <PageContainer wide>
            <AppPageHeader
                showBack
                title={area.label}
                subtitle="Wähle ein Tool — alles läuft lokal im Browser."
                actions={
                    <span
                        className="inline-flex h-9 w-9 items-center justify-center rounded-[9px] border-2 border-black"
                        style={{ background: area.accent }}
                    >
                        <Icon svg={area.icon} size={20} />
                    </span>
                }
            >
                {areaId === 'bilder' ? (
                    <Link
                        to={conversionHubPath()}
                        className="ms-focus mt-2 inline-flex items-center gap-1 font-display text-[12px] font-semibold underline decoration-[var(--color-line)] underline-offset-2"
                    >
                        Bildformate umwandeln
                        <span aria-hidden>→</span>
                    </Link>
                ) : null}
            </AppPageHeader>

            <section className="max-w-[720px]">
                <div className="overflow-hidden rounded-[14px] border-2 border-black bg-white shadow-brutal">
                    <PickListSearch
                        attached
                        value={query}
                        onChange={setQuery}
                        onSubmit={submitSelection}
                        placeholder="Tool suchen …"
                    />

                    {visibleTools.length === 0 ? (
                        <p className="border-t-2 border-black px-4 py-4 text-[15px] text-[var(--color-ink-soft)]">
                            {emptyHint}
                        </p>
                    ) : (
                        <ul className="ms-stagger border-t-2 border-black" role="listbox" aria-label="Tools">
                            {visibleTools.map((tool, index) => (
                                <li key={tool.id} role="presentation">
                                    <ToolListRow
                                        tool={tool}
                                        areaAccent={area.accent}
                                        isLast={index === visibleTools.length - 1}
                                        onSelect={() => selectTool(tool.id)}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </PageContainer>
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
