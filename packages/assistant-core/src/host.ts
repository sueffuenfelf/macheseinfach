import type {
    AreaDetail,
    AreaSummary,
    AttachmentPayload,
    AttachmentRef,
    FlowDefinition,
    FlowSummary,
    ToolHit,
    ToolMeta,
    ToolRunResult,
    UserInputRequest,
} from './types';

export type AssistantHost = {
    listAreas(): AreaSummary[];
    getArea(areaId: string): AreaDetail | null;
    listFlows(filter?: { areaId?: string; query?: string }): FlowSummary[];
    getFlow(flowId: string): FlowDefinition | null;
    searchTools(query: string, opts?: { areaId?: string; limit?: number }): ToolHit[];
    getTool(toolId: string): ToolMeta | null;
    listFavorites(): ToolHit[];
    runTool(toolId: string, input: unknown): Promise<ToolRunResult>;
    openFlow(flowId: string, slots?: Record<string, unknown>): void;
    openTool(toolId: string, prefill?: unknown): Promise<void>;
    requestUserInput(req: UserInputRequest): Promise<AttachmentRef | { cancelled: true }>;
    resolveAttachment(id: string): Promise<AttachmentPayload | null>;
};
