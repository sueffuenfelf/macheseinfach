import { areas, getTool, type AreaId } from '../data/catalog';
import type { ScoredResult } from '../search';
import type { CSSProperties } from 'react';

function kindLabel(kind: ScoredResult['document']['kind']): string {
    switch (kind) {
        case 'tool':
            return 'Tool';
        case 'variant':
            return 'Variante';
        case 'story':
            return 'Situation';
        case 'area':
            return 'Bereich';
    }
}

function kindEyebrowClass(kind: ScoredResult['document']['kind']): string {
    switch (kind) {
        case 'area':
            return 'bg-black text-white';
        case 'tool':
            return 'bg-white text-black';
        case 'variant':
            return 'bg-[var(--color-chip)] text-black';
        case 'story':
            return 'bg-white text-black';
    }
}

type SearchResultRowProps = {
    result: ScoredResult;
    active?: boolean;
    compact?: boolean;
    showSource?: boolean;
    sourceLabel?: string;
    showBreakdown?: boolean;
    onClick: () => void;
};

export function SearchResultRow({
    result,
    active = false,
    compact = false,
    showSource = false,
    sourceLabel,
    showBreakdown = false,
    onClick,
}: SearchResultRowProps) {
    const { document: doc } = result;
    const areaId = doc.areaId as AreaId | undefined;
    const accent = areaId ? areas[areaId].accent : '#e5e5e5';
    const isArea = doc.kind === 'area';
    const command =
        doc.toolId && doc.kind !== 'area' ? getTool(doc.toolId).command : null;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`ms-focus relative w-full overflow-hidden text-left transition ${
                compact
                    ? `rounded-[10px] px-3 py-2.5 ${
                          active ? 'bg-[var(--row-accent)]' : 'hover:bg-[var(--color-chip)]'
                      }`
                    : 'ms-card ms-card-hover p-4'
            }`}
            style={
                {
                    ['--row-accent']: accent,
                    borderLeftWidth: compact ? undefined : 6,
                    borderLeftColor: compact ? undefined : accent,
                    background: !compact && isArea ? `${accent}33` : undefined,
                } as CSSProperties
            }
        >
            {compact ? (
                <span
                    aria-hidden
                    className="absolute top-2 bottom-2 left-0 w-[4px] rounded-r-[2px]"
                    style={{ background: accent }}
                />
            ) : null}
            <span className={`flex flex-wrap items-center gap-2 ${compact ? 'pl-2' : ''}`}>
                <span
                    className={`inline-flex items-center rounded-[6px] border-2 border-black px-2 py-0.5 font-display text-[11px] font-bold tracking-[0.02em] uppercase ${kindEyebrowClass(doc.kind)}`}
                >
                    {kindLabel(doc.kind)}
                </span>
                {isArea && areaId ? (
                    <span
                        className="inline-flex h-5 w-5 items-center justify-center rounded-[5px] border-2 border-black"
                        style={{ background: accent }}
                        aria-hidden
                    />
                ) : null}
                {showSource && sourceLabel ? (
                    <span className="rounded-full border border-black/25 bg-white px-2 py-0.5 font-display text-[10px] font-semibold text-[var(--color-ink-soft)]">
                        {sourceLabel}
                    </span>
                ) : null}
            </span>
            <span
                className={`mt-1.5 block font-display font-bold tracking-[-0.01em] ${
                    compact ? 'pl-2 text-[14px]' : 'text-[16px]'
                } ${isArea ? 'text-[17px]' : ''}`}
            >
                {doc.title}
            </span>
            <span
                className={`mt-0.5 block text-[var(--color-ink-soft)] ${
                    compact ? 'pl-2 text-[12px]' : 'text-[13px]'
                }`}
            >
                {doc.subtitle}
            </span>
            {command ? (
                <span
                    className={`mt-1.5 block font-mono text-[11px] text-[var(--color-ink-muted)] ${
                        compact ? 'pl-2' : ''
                    }`}
                >
                    {command}
                </span>
            ) : null}
            {showBreakdown && result.breakdown ? (
                <span className="mt-2 block font-mono text-[10px] text-[var(--color-ink-muted)]">
                    L:{result.breakdown.lexical.toFixed(2)} S:
                    {result.breakdown.semantic.toFixed(2)} B:
                    {result.breakdown.slotBoost.toFixed(2)}
                    {result.breakdown.chrome != null
                        ? ` C:${result.breakdown.chrome.toFixed(2)}`
                        : ''}{' '}
                    → {result.breakdown.merged.toFixed(2)}
                </span>
            ) : null}
        </button>
    );
}
