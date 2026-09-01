import type {
    AreaDetail,
    AreaSummary,
    AttachmentPayload,
    AttachmentRef,
    ToolHit,
    ToolMeta,
    ToolRunResult,
    UserInputRequest,
} from './types';

export type AssistantHost = {
    listAreas(): AreaSummary[];
    getArea(areaId: string): AreaDetail | null;
    searchTools(query: string, opts?: { areaId?: string; limit?: number }): ToolHit[];
    getTool(toolId: string): ToolMeta | null;
    listFavorites(): ToolHit[];
    runTool(toolId: string, input: unknown): Promise<ToolRunResult>;
    openTool(toolId: string, prefill?: unknown): Promise<void>;
    requestUserInput(req: UserInputRequest): Promise<AttachmentRef | { cancelled: true }>;
    resolveAttachment(id: string): Promise<AttachmentPayload | null>;
};
