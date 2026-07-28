import type { ChatMessage, ToolCall } from '@macheseinfach/openrouter';

export type AssistantEvent =
    | { type: 'stream'; content: string }
    | { type: 'tool_start'; toolCallId: string; name: string; arguments: string }
    | { type: 'tool_end'; toolCallId: string; name: string; result: string }
    | { type: 'assistant_message'; message: ChatMessage }
    | { type: 'done' }
    | { type: 'error'; error: Error };

export type AssistantEventHandler = (event: AssistantEvent) => void;

export type PendingToolCall = ToolCall;
