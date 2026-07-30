export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

export type ChatMessage = {
    role: ChatRole;
    content: string | null;
    tool_calls?: ToolCall[];
    tool_call_id?: string;
    name?: string;
};

export type ToolCall = {
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
};

export type ToolDefinition = {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    };
};

export type ChatCompletionRequest = {
    model: string;
    messages: ChatMessage[];
    tools?: ToolDefinition[];
    tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
    temperature?: number;
    stream?: boolean;
};

export type ToolCallDelta = {
    index: number;
    id?: string;
    type?: 'function';
    function?: {
        name?: string;
        arguments?: string;
    };
};

export type ChatStreamChunk =
    | { type: 'content'; content: string }
    | { type: 'tool_call_delta'; delta: ToolCallDelta }
    | { type: 'done'; message: ChatMessage };
