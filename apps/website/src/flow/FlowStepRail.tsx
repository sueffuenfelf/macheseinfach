import {
    type KeyboardEvent as ReactKeyboardEvent,
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
} from 'react';
import { getTool } from '../data/catalog';
import type { FlowDefinition, FlowRecommendation, FlowStep, ToolId } from '../data/catalog/types';
import { stepIndexForTool, stepProgress } from './flow-workspace-policy';

type FlowStepRailProps = {
    flow: FlowDefinition;
    activeToolId: ToolId | null;
    successToolIds: ReadonlySet<ToolId>;
    onSelectTool: (toolId: ToolId) => void;
    /** Compact mode inside mobile sheet */
    compact?: boolean;
};

export function FlowStepRail({
    flow,
    activeToolId,
    successToolIds,
    onSelectTool,
    compact = false,
}: FlowStepRailProps) {
    const listId = useId();
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [focusIndex, setFocusIndex] = useState(0);
    const progress = stepProgress(flow, successToolIds);

    const steps = flow.steps;
    const recommended = flow.recommended ?? [];

    useEffect(() => {
        const idx = activeToolId ? stepIndexForTool(flow, activeToolId) : 0;
        if (idx >= 0) setFocusIndex(idx);
    }, [activeToolId, flow]);

    const activate = useCallback(
        (toolId: ToolId) => {
            onSelectTool(toolId);
        },
        [onSelectTool],
    );

    const onKeyDown = useCallback(
        (e: ReactKeyboardEvent) => {
            const total = steps.length;
            if (total === 0) return;
            let next = focusIndex;
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                next = Math.min(total - 1, focusIndex + 1);
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                next = Math.max(0, focusIndex - 1);
            } else if (e.key === 'Home') {
                e.preventDefault();
                next = 0;
            } else if (e.key === 'End') {
                e.preventDefault();
                next = total - 1;
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const step = steps[focusIndex];
                if (step) activate(step.toolId);
                return;
            } else {
                return;
            }
            setFocusIndex(next);
            itemRefs.current[next]?.focus();
        },
        [activate, focusIndex, steps],
    );

    return (
        <nav
            aria-label="Vorhaben-Schritte"
            className={compact ? 'space-y-4' : 'space-y-5'}
            data-testid="flow-step-rail"
        >
            <div>
                <p className="font-display text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--color-ink-muted)]">
                    Schritte
                </p>
                <p className="mt-1 text-[12px] text-[var(--color-ink-soft)]">
                    {progress.done}/{progress.total} erledigt
                </p>
            </div>

            <ul id={listId} aria-label="Schritte" className="space-y-1" onKeyDown={onKeyDown}>
                {steps.map((step, index) => (
                    <li key={step.toolId} role="presentation">
                        <StepButton
                            ref={(el) => {
                                itemRefs.current[index] = el;
                            }}
                            step={step}
                            index={index}
                            active={activeToolId === step.toolId}
                            done={successToolIds.has(step.toolId)}
                            tabIndex={focusIndex === index ? 0 : -1}
                            onSelect={() => {
                                setFocusIndex(index);
                                activate(step.toolId);
                            }}
                        />
                    </li>
                ))}
            </ul>

            {recommended.length > 0 ? (
                <RecommendedSection
                    items={recommended}
                    activeToolId={activeToolId}
                    onSelect={activate}
                />
            ) : null}
        </nav>
    );
}

function StepButton({
    step,
    index,
    active,
    done,
    tabIndex,
    onSelect,
    ref,
}: {
    step: FlowStep;
    index: number;
    active: boolean;
    done: boolean;
    tabIndex: number;
    onSelect: () => void;
    ref?: (el: HTMLButtonElement | null) => void;
}) {
    const tool = getTool(step.toolId);
    const optional = Boolean(step.optional);
    const label = step.label || tool?.shortTitle || step.toolId;

    return (
        <button
            ref={ref}
            type="button"
            aria-current={active ? 'step' : undefined}
            tabIndex={tabIndex}
            onClick={onSelect}
            className={`ms-focus flex w-full items-start gap-2.5 rounded-[10px] border-2 px-3 py-2.5 text-left transition ${
                active
                    ? 'border-black bg-white shadow-[2px_2px_0_#000]'
                    : 'border-transparent hover:border-black/30 hover:bg-white/60'
            } ${optional ? 'opacity-70' : ''}`}
            data-optional={optional ? 'true' : undefined}
        >
            <span
                className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-black font-display text-[11px] font-bold ${
                    active ? 'bg-black text-white' : done ? 'bg-[var(--color-chip)]' : 'bg-white'
                }`}
                aria-hidden
            >
                {done && !active ? '✓' : index + 1}
            </span>
            <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                    <span
                        className={`block font-display text-[14px] font-semibold leading-tight ${
                            optional ? 'text-[var(--color-ink-soft)]' : ''
                        }`}
                    >
                        {label}
                    </span>
                    {optional ? (
                        <span className="rounded-full border border-black/40 px-1.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                            Optional
                        </span>
                    ) : null}
                </span>
                {step.why ? (
                    <span className="mt-0.5 block text-[12px] text-[var(--color-ink-soft)]">
                        {step.why}
                    </span>
                ) : null}
            </span>
        </button>
    );
}

function RecommendedSection({
    items,
    activeToolId,
    onSelect,
}: {
    items: readonly FlowRecommendation[];
    activeToolId: ToolId | null;
    onSelect: (toolId: ToolId) => void;
}) {
    return (
        <div
            className="border-t-2 border-dashed border-black/25 pt-4"
            data-testid="flow-recommended"
        >
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--color-ink-muted)]">
                Auch interessant
            </p>
            <ul className="mt-2 space-y-1">
                {items.map((rec) => {
                    const tool = getTool(rec.toolId);
                    const active = activeToolId === rec.toolId;
                    return (
                        <li key={rec.toolId}>
                            <button
                                type="button"
                                onClick={() => onSelect(rec.toolId)}
                                className={`ms-focus w-full rounded-[10px] border border-black/20 px-3 py-2 text-left transition ${
                                    active
                                        ? 'border-black bg-white shadow-[2px_2px_0_#000]'
                                        : 'hover:border-black/40 hover:bg-white/50'
                                }`}
                            >
                                <span className="block font-display text-[13px] font-semibold text-[var(--color-ink-soft)]">
                                    {tool?.shortTitle ?? rec.toolId}
                                </span>
                                <span className="mt-0.5 block text-[11px] text-[var(--color-ink-muted)]">
                                    {rec.reason}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
