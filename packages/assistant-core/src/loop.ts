import type { ChatMessage, OpenRouterClient } from '@macheseinfach/openrouter';
import type { AssistantEventHandler } from './events';
import type { AssistantHost } from './host';
import { META_TOOL_NAMES, metaToolsToDefinitions } from './meta-tools';
import { buildSystemPrompt, type ActiveFlowContext } from './system-prompt';
import type { AssistantThread, ChatAttachment, StoredMessage, ToolHit } from './types';

const DEFAULT_MAX_TOOL_ROUNDS = 8;

export type RunAssistantTurnArgs = {
    client: OpenRouterClient;
    model: string;
    thread: AssistantThread;
    host: AssistantHost;
    favorites: ToolHit[];
    attachments?: ChatAttachment[];
    activeFlow?: ActiveFlowContext;
    onEvent: AssistantEventHandler;
    maxToolRounds?: number;
    /** When true, token deltas are emitted via `stream` events (final message still stored). */
    stream?: boolean;
};

function storedToChatMessage(msg: StoredMessage): ChatMessage {
    return {
        role: msg.role,
        content: msg.content,
        ...(msg.tool_calls ? { tool_calls: msg.tool_calls } : {}),
        ...(msg.tool_call_id ? { tool_call_id: msg.tool_call_id } : {}),
        ...(msg.name ? { name: msg.name } : {}),
    };
}

function buildAttachmentSummary(attachments: ChatAttachment[]): string | null {
    if (!attachments.length) {
        return null;
    }
    const lines = attachments.map(
        (a) =>
            `- ${a.id}: ${a.name} (${a.kind}${a.mime ? `, ${a.mime}` : ''})${a.text ? ` — text preview: ${a.text.slice(0, 120)}` : ''}`,
    );
    return `Thread attachments (metadata only, no raw file bytes):\n${lines.join('\n')}`;
}

export function buildTurnMessages(args: {
    thread: AssistantThread;
    favorites: ToolHit[];
    attachments?: ChatAttachment[];
    activeFlow?: ActiveFlowContext;
}): ChatMessage[] {
    const messages: ChatMessage[] = [
        {
            role: 'system',
            content: buildSystemPrompt({
                favorites: args.favorites,
                locale: 'de',
                activeFlow: args.activeFlow,
            }),
        },
    ];

    const attachmentSummary = buildAttachmentSummary(args.attachments ?? []);
    if (attachmentSummary) {
        messages.push({ role: 'system', content: attachmentSummary });
    }

    for (const msg of args.thread.messages) {
        messages.push(storedToChatMessage(msg));
    }

    return messages;
}

function parseToolArguments(raw: string): Record<string, unknown> {
    try {
        const parsed = JSON.parse(raw || '{}');
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            return parsed as Record<string, unknown>;
        }
        return {};
    } catch {
        return {};
    }
}

async function executeMetaTool(
    host: AssistantHost,
    thread: AssistantThread,
    name: string,
    args: Record<string, unknown>,
): Promise<unknown> {
    switch (name) {
        case 'list_areas':
            return host.listAreas();
        case 'get_area': {
            const areaId = String(args.areaId ?? '');
            return host.getArea(areaId);
        }
        case 'list_flows':
            return host.listFlows({
                areaId: args.areaId ? String(args.areaId) : undefined,
                query: args.query ? String(args.query) : undefined,
            });
        case 'get_flow': {
            const flowId = String(args.flowId ?? '');
            return host.getFlow(flowId);
        }
        case 'search_tools':
            return host.searchTools(String(args.query ?? ''), {
                areaId: args.areaId ? String(args.areaId) : undefined,
                limit: typeof args.limit === 'number' ? args.limit : undefined,
            });
        case 'get_tool': {
            const toolId = String(args.toolId ?? '');
            return host.getTool(toolId);
        }
        case 'list_favorites':
            return host.listFavorites();
        case 'request_user_input':
            return host.requestUserInput({
                kind: args.kind as 'file' | 'files' | 'text' | 'multiline',
                prompt: String(args.prompt ?? ''),
                accept: args.accept ? String(args.accept) : undefined,
                slotHint: args.slotHint ? String(args.slotHint) : undefined,
            });
        case 'attach_from_chat': {
            const attachmentId = String(args.attachmentId ?? '');
            if (!thread.attachmentIds.includes(attachmentId)) {
                return { error: `Attachment ${attachmentId} is not in this thread` };
            }
            const payload = await host.resolveAttachment(attachmentId);
            if (!payload) {
                return { error: `Attachment ${attachmentId} not found` };
            }
            return {
                attachmentId: payload.id,
                name: payload.name,
                kind: payload.kind,
                mime: payload.mime,
                text: payload.text,
            };
        }
        case 'run_tool': {
            const toolId = String(args.toolId ?? '');
            const input = args.input ?? {};
            const openInUi = args.openInUi === true;
            if (openInUi) {
                await host.openTool(toolId, input);
                return {
                    ok: true,
                    summary: 'Tool in der Oberfläche geöffnet.',
                    openInUi: true,
                    toolId,
                };
            }
            return host.runTool(toolId, input);
        }
        case 'open_flow': {
            const flowId = String(args.flowId ?? '');
            const slotValues =
                typeof args.slotValues === 'object' && args.slotValues !== null
                    ? (args.slotValues as Record<string, unknown>)
                    : undefined;
            host.openFlow(flowId, slotValues);
            return { ok: true, flowId, summary: 'Vorhaben in der Oberfläche geöffnet.' };
        }
        case 'open_tool': {
            const toolId = String(args.toolId ?? '');
            const prefill =
                typeof args.prefill === 'object' && args.prefill !== null
                    ? (args.prefill as Record<string, unknown>)
                    : undefined;
            await host.openTool(toolId, prefill);
            return { ok: true, toolId, summary: 'Tool in der Oberfläche geöffnet.' };
        }
        default:
            return { error: `Unknown tool: ${name}` };
    }
}

function createStoredMessage(
    partial: Omit<StoredMessage, 'id' | 'createdAt'> & { id?: string; createdAt?: number },
): StoredMessage {
    return {
        id: partial.id ?? crypto.randomUUID(),
        createdAt: partial.createdAt ?? Date.now(),
        role: partial.role,
        content: partial.content,
        ...(partial.tool_calls ? { tool_calls: partial.tool_calls } : {}),
        ...(partial.tool_call_id ? { tool_call_id: partial.tool_call_id } : {}),
        ...(partial.name ? { name: partial.name } : {}),
        ...(partial.attachmentIds ? { attachmentIds: partial.attachmentIds } : {}),
    };
}

async function completeAssistantMessage(
    args: RunAssistantTurnArgs,
    messages: ChatMessage[],
    tools: ReturnType<typeof metaToolsToDefinitions>,
): Promise<ChatMessage> {
    const request = {
        model: args.model,
        messages,
        tools,
        tool_choice: 'auto' as const,
    };

    if (!args.stream) {
        return await args.client.chat(request);
    }

    let assistant: ChatMessage = { role: 'assistant', content: '' };
    for await (const chunk of args.client.chatStream(request)) {
        if (chunk.type === 'content') {
            assistant.content = `${assistant.content ?? ''}${chunk.content}`;
            args.onEvent({ type: 'stream', content: chunk.content });
        }
        if (chunk.type === 'done') {
            assistant = chunk.message;
        }
    }
    return assistant;
}

export async function runAssistantTurn(args: RunAssistantTurnArgs): Promise<void> {
    const maxToolRounds = args.maxToolRounds ?? DEFAULT_MAX_TOOL_ROUNDS;
    const tools = metaToolsToDefinitions();
    const resultCache = new Map<string, string>();
    let toolRounds = 0;

    const messages = buildTurnMessages({
        thread: args.thread,
        favorites: args.favorites,
        attachments: args.attachments,
        activeFlow: args.activeFlow,
    });

    try {
        while (true) {
            const assistant = await completeAssistantMessage(args, messages, tools);

            if (!assistant.tool_calls?.length) {
                const stored = createStoredMessage({
                    role: 'assistant',
                    content: assistant.content,
                });
                args.thread.messages.push(stored);
                args.thread.updatedAt = Date.now();
                args.onEvent({ type: 'assistant_message', message: assistant });
                args.onEvent({ type: 'done' });
                return;
            }

            const assistantStored = createStoredMessage({
                role: 'assistant',
                content: assistant.content,
                tool_calls: assistant.tool_calls,
            });
            args.thread.messages.push(assistantStored);
            args.thread.updatedAt = Date.now();
            args.onEvent({ type: 'assistant_message', message: assistant });

            toolRounds += 1;
            if (toolRounds > maxToolRounds) {
                const guardMessage = createStoredMessage({
                    role: 'assistant',
                    content: 'Maximale Anzahl an Tool-Runden erreicht.',
                });
                args.thread.messages.push(guardMessage);
                args.thread.updatedAt = Date.now();
                args.onEvent({
                    type: 'assistant_message',
                    message: { role: 'assistant', content: guardMessage.content },
                });
                args.onEvent({ type: 'done' });
                return;
            }

            messages.push({
                role: 'assistant',
                content: assistant.content,
                tool_calls: assistant.tool_calls,
            });

            for (const toolCall of assistant.tool_calls) {
                const { id, function: fn } = toolCall;
                args.onEvent({
                    type: 'tool_start',
                    toolCallId: id,
                    name: fn.name,
                    arguments: fn.arguments,
                });

                let result: string;
                if (resultCache.has(id)) {
                    result = resultCache.get(id)!;
                } else {
                    let payload: unknown;
                    if (!META_TOOL_NAMES.has(fn.name)) {
                        payload = { error: `Unknown tool: ${fn.name}` };
                    } else {
                        const parsedArgs = parseToolArguments(fn.arguments);
                        payload = await executeMetaTool(
                            args.host,
                            args.thread,
                            fn.name,
                            parsedArgs,
                        );
                    }
                    result = JSON.stringify(payload);
                    resultCache.set(id, result);
                }

                const toolMessage: ChatMessage = {
                    role: 'tool',
                    tool_call_id: id,
                    name: fn.name,
                    content: result,
                };
                messages.push(toolMessage);

                const toolStored = createStoredMessage({
                    role: 'tool',
                    content: result,
                    tool_call_id: id,
                    name: fn.name,
                });
                args.thread.messages.push(toolStored);
                args.thread.updatedAt = Date.now();

                args.onEvent({
                    type: 'tool_end',
                    toolCallId: id,
                    name: fn.name,
                    result,
                });
            }
        }
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        args.onEvent({ type: 'error', error: err });
        throw err;
    }
}
