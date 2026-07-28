import type { ChatRole, ToolCall } from '@macheseinfach/openrouter';

export type AttachmentKind = 'file' | 'text';

export type ChatAttachment = {
    id: string;
    kind: AttachmentKind;
    name: string;
    mime?: string;
    text?: string;
    blobKey?: string;
    createdAt: number;
    source: 'user_upload' | 'user_prompt' | 'tool_output';
};

export type StoredMessage = {
    id: string;
    role: ChatRole;
    content: string | null;
    tool_calls?: ToolCall[];
    tool_call_id?: string;
    name?: string;
    createdAt: number;
    attachmentIds?: string[];
};

export type AssistantThread = {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    messages: StoredMessage[];
    attachmentIds: string[];
};

export type ToolHit = {
    id: string;
    title: string;
    sub?: string;
    areaId?: string;
    tags?: string[];
};

export type AreaSummary = {
    id: string;
    label: string;
    description: string;
    toolCount: number;
};

export type AreaDetail = AreaSummary & {
    tools: ToolHit[];
};

export type FlowSummary = {
    id: string;
    title: string;
    description?: string;
    areaId?: string;
};

export type FlowStep = {
    id: string;
    title: string;
    toolId?: string;
};

export type FlowDefinition = FlowSummary & {
    steps: FlowStep[];
    recommended: string[];
    slotSchema?: Record<string, unknown>;
};

export type ToolMeta = ToolHit & {
    inputSchema?: Record<string, unknown>;
    description?: string;
};

export type ToolRunResult = {
    ok: boolean;
    summary?: string;
    output?: unknown;
    error?: string;
};

export type UserInputKind = 'file' | 'files' | 'text' | 'multiline';

export type UserInputRequest = {
    kind: UserInputKind;
    prompt: string;
    accept?: string;
    slotHint?: string;
};

export type AttachmentRef = {
    attachmentId: string;
    name: string;
    kind: AttachmentKind;
    mime?: string;
};

export type AttachmentPayload = ChatAttachment;

export type AssistantLayoutMode = 'sidebar' | 'floating';

export type AssistantSettings = {
    layoutMode: AssistantLayoutMode;
    openRouterApiKey: string;
    model: string;
    enabled: boolean;
};

export const ASSISTANT_STORAGE_KEYS = {
    settings: 'msf.assistant.settings',
    threadIndex: 'msf.assistant.threadIndex',
    openRouterApiKey: 'msf.settings.openRouterApiKey',
    idbThreads: 'msf.assistant.threads',
    idbBlobs: 'msf.assistant.blobs',
} as const;
