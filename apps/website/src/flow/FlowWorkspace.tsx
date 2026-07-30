import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { areas, getTool, type StoryId, stories, type ToolId } from '../data/catalog';
import { areaPath, toolPath } from '../routing/paths';
import { usePlatformNav } from '../routing/usePlatformNav';
import { ToolBody } from '../tools/_shared/ToolBody';
import { FlowContextBar } from './FlowContextBar';
import { FlowContextProvider, useFlowContext } from './FlowContextProvider';
import { FlowContinueFooter } from './FlowContinueFooter';
import { FlowLeaveConfirm } from './FlowLeaveConfirm';
import { FlowMobileSheet } from './FlowMobileSheet';
import { FlowStepRail } from './FlowStepRail';
import {
    firstRequiredStep,
    hasAnySlotSet,
    isSideQuestTool,
    missingRequiredSlots,
    shouldUseFlowWorkspace,
} from './flow-workspace-policy';

type FlowSessionApi = {
    reportToolSuccess: (toolId: ToolId) => void;
    successToolIds: ReadonlySet<ToolId>;
};

const FlowSessionContext = createContext<FlowSessionApi | null>(null);

/** Optional: shells / bespoke tools can mark success for Continue footer emphasis. */
export function useFlowSession(): FlowSessionApi | null {
    return useContext(FlowSessionContext);
}

type FlowWorkspaceProps = {
    flowId: StoryId;
};

/**
 * Split-view Vorhaben workspace. Provider mounts once per flowId — tool switches
 * remount only ToolBody, not the context provider.
 */
export function FlowWorkspace({ flowId }: FlowWorkspaceProps) {
    const flow = stories[flowId];
    if (!flow || !shouldUseFlowWorkspace(flow)) {
        return null;
    }

    return (
        <FlowContextProvider
            key={flowId}
            flowId={flowId}
            schema={flow.context}
            stepBindings={flow.stepBindings}
        >
            <FlowWorkspaceInner flowId={flowId} />
        </FlowContextProvider>
    );
}

function FlowWorkspaceInner({ flowId }: { flowId: StoryId }) {
    const flow = stories[flowId];
    const navigate = useNavigate();
    const { activeAreaId, activeTool } = usePlatformNav();
    const ctx = useFlowContext();
    const mainRef = useRef<HTMLElement>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [successToolIds, setSuccessToolIds] = useState<Set<ToolId>>(() => new Set());
    const [leaveOpen, setLeaveOpen] = useState(false);
    const [clearOnly, setClearOnly] = useState(false);
    const pendingLeaveRef = useRef<(() => void) | null>(null);

    const areaId = activeAreaId ?? flow?.areaIds[0] ?? 'behoerden';
    const activeToolId = activeTool?.id ?? null;

    // URL sync: missing tool → first required step (replace)
    useEffect(() => {
        if (!flow) return;
        if (activeToolId) {
            const inSteps = flow.steps.some((s) => s.toolId === activeToolId);
            const inRec = (flow.recommended ?? []).some((r) => r.toolId === activeToolId);
            if (inSteps || inRec) return;
        }
        const first = firstRequiredStep(flow);
        navigate(toolPath(areaId, flowId, first.toolId), { replace: true });
    }, [activeToolId, areaId, flow, flowId, navigate]);

    // Focus main landmark on tool switch
    useEffect(() => {
        if (!activeToolId) return;
        mainRef.current?.focus();
    }, [activeToolId]);

    const reportToolSuccess = useCallback((toolId: ToolId) => {
        setSuccessToolIds((prev) => {
            if (prev.has(toolId)) return prev;
            const next = new Set(prev);
            next.add(toolId);
            return next;
        });
    }, []);

    const session = useMemo<FlowSessionApi>(
        () => ({ reportToolSuccess, successToolIds }),
        [reportToolSuccess, successToolIds],
    );

    const requestLeave = useCallback(
        (navigateAway: () => void, opts?: { clearOnly?: boolean }) => {
            const slotsSet = ctx && hasAnySlotSet(ctx.schema.slots, ctx.getSlot);
            if (slotsSet) {
                pendingLeaveRef.current = navigateAway;
                setClearOnly(Boolean(opts?.clearOnly));
                setLeaveOpen(true);
                return;
            }
            if (opts?.clearOnly) {
                ctx?.clearAll();
                return;
            }
            navigateAway();
        },
        [ctx],
    );

    const confirmLeave = useCallback(() => {
        ctx?.clearAll();
        setLeaveOpen(false);
        const pending = pendingLeaveRef.current;
        pendingLeaveRef.current = null;
        if (clearOnly) return;
        pending?.();
    }, [clearOnly, ctx]);

    const cancelLeave = useCallback(() => {
        pendingLeaveRef.current = null;
        setLeaveOpen(false);
        setClearOnly(false);
    }, []);

    const onSelectTool = useCallback(
        (toolId: ToolId) => {
            // Keep URL under current Vorhaben (side-quests may not list this storyId)
            navigate(toolPath(areaId, flowId, toolId));
            setSheetOpen(false);
        },
        [areaId, flowId, navigate],
    );

    const handleBack = useCallback(() => {
        requestLeave(() => {
            navigate(areaPath(areaId));
        });
    }, [areaId, navigate, requestLeave]);

    if (!flow) return null;

    const tool = activeToolId ? getTool(activeToolId) : null;
    const sideQuest = activeToolId ? isSideQuestTool(flow, activeToolId) : false;
    const missing = ctx ? missingRequiredSlots(ctx.schema.slots, ctx.getSlot) : [];

    return (
        <FlowSessionContext.Provider value={session}>
            <div
                className="flex min-h-0 flex-1 flex-col"
                data-testid="flow-workspace"
                data-flow-id={flowId}
            >
                {/* Mobile: sticky steps trigger */}
                <div className="flex items-center justify-between gap-2 border-b-2 border-black bg-white px-4 py-2 md:hidden">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="ms-focus inline-flex items-center gap-1.5 rounded-[8px] border-2 border-black bg-white px-2.5 py-1.5 font-display text-[13px] font-semibold shadow-[2px_2px_0_#000]"
                    >
                        ← Bereich
                    </button>
                    <button
                        type="button"
                        className="ms-btn"
                        onClick={() => setSheetOpen(true)}
                        data-testid="flow-open-steps"
                    >
                        Schritte
                    </button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col md:flex-row">
                    {/* Desktop rail ~280px */}
                    <aside
                        className="hidden w-[280px] shrink-0 border-r-2 border-black bg-[var(--color-canvas)] md:block"
                        data-testid="flow-desktop-rail"
                    >
                        <div className="sticky top-0 max-h-screen space-y-4 overflow-y-auto p-4">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="ms-focus inline-flex items-center gap-1.5 rounded-[8px] border-2 border-black bg-white px-3 py-2 font-display text-[13px] font-semibold shadow-[2px_2px_0_#000]"
                            >
                                ← {areas[areaId]?.shortLabel ?? 'Bereich'}
                            </button>
                            <FlowStepRail
                                flow={flow}
                                activeToolId={activeToolId}
                                successToolIds={successToolIds}
                                onSelectTool={onSelectTool}
                            />
                        </div>
                    </aside>

                    {/* Main pane */}
                    <div className="flex min-w-0 flex-1 flex-col">
                        <FlowContextBar
                            flowTitle={flow.outcome}
                            onRequestClear={() => requestLeave(() => {}, { clearOnly: true })}
                        />

                        <main
                            ref={mainRef}
                            tabIndex={-1}
                            className="ms-focus outline-none flex-1 px-4 py-5 md:px-6"
                            aria-label={tool?.title ?? 'Tool'}
                            data-testid="flow-tool-main"
                        >
                            {sideQuest ? (
                                <p className="mb-3 rounded-[10px] border border-dashed border-black/40 bg-white px-3 py-2 text-[12px] text-[var(--color-ink-soft)]">
                                    Side-Quest — zählt nicht zum Vorhaben-Fortschritt.
                                </p>
                            ) : null}
                            {missing.length > 0 && activeToolId ? (
                                <p
                                    className="mb-3 text-[12px] text-[var(--color-ink-muted)]"
                                    data-testid="flow-capture-hint"
                                >
                                    Leere Pflichtfelder: Tool im Capture-Modus — Eingaben fließen
                                    ins Vorhaben.
                                </p>
                            ) : null}
                            {tool ? (
                                <ToolBody tool={tool} />
                            ) : (
                                <p className="text-[14px] text-[var(--color-ink-soft)]">
                                    Schritt wird geladen …
                                </p>
                            )}
                        </main>

                        <FlowContinueFooter
                            flow={flow}
                            activeToolId={activeToolId}
                            successToolIds={successToolIds}
                            onContinue={onSelectTool}
                        />
                    </div>
                </div>

                <FlowMobileSheet
                    open={sheetOpen}
                    onClose={() => setSheetOpen(false)}
                    flow={flow}
                    activeToolId={activeToolId}
                    successToolIds={successToolIds}
                    onSelectTool={onSelectTool}
                />

                <FlowLeaveConfirm
                    open={leaveOpen}
                    title={clearOnly ? 'Kontext löschen?' : 'Vorhaben verlassen?'}
                    message={
                        clearOnly
                            ? 'Alle Felder in diesem Vorhaben werden geleert. Passwörter werden nicht gespeichert.'
                            : 'Du verlässt das Vorhaben. Gespeicherte Eingaben werden gelöscht. Passwörter immer.'
                    }
                    confirmLabel={clearOnly ? 'Kontext löschen' : 'Löschen und verlassen'}
                    onConfirm={confirmLeave}
                    onCancel={cancelLeave}
                />
            </div>
        </FlowSessionContext.Provider>
    );
}

/** Re-export for ToolShell gating */
export { firstRequiredStep, shouldUseFlowWorkspace };
