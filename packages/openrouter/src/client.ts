import { OpenRouterError, openRouterErrorMessage } from './errors';
import type {
    ChatCompletionRequest,
    ChatMessage,
    ChatStreamChunk,
    ToolCall,
    ToolCallDelta,
} from './types';

const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';

export type OpenRouterClientOptions = {
    apiKey: string;
    baseUrl?: string;
    defaultHeaders?: Record<string, string>;
    fetch?: typeof fetch;
};

export type ChatRequestOptions = {
    signal?: AbortSignal;
};

export type OpenRouterClient = ReturnType<typeof createOpenRouterClient>;

type CompletionChoice = {
    message?: {
        role?: string;
        content?: string | null;
        tool_calls?: Array<{
            id: string;
            type: 'function';
            function: { name: string; arguments: string };
        }>;
    };
};

type CompletionResponse = {
    choices?: CompletionChoice[];
};

type StreamDelta = {
    choices?: Array<{
        delta?: {
            content?: string | null;
            tool_calls?: ToolCallDelta[];
        };
        finish_reason?: string | null;
    }>;
};

export function parseToolCalls(
    raw: CompletionChoice['message'] | undefined,
): ToolCall[] | undefined {
    if (!raw?.tool_calls?.length) {
        return undefined;
    }
    return raw.tool_calls.map((tc) => ({
        id: tc.id,
        type: 'function' as const,
        function: {
            name: tc.function.name,
            arguments: tc.function.arguments ?? '',
        },
    }));
}

export function parseAssistantMessage(raw: CompletionChoice['message']): ChatMessage {
    const tool_calls = parseToolCalls(raw);
    return {
        role: 'assistant',
        content: raw?.content ?? null,
        ...(tool_calls ? { tool_calls } : {}),
    };
}

function buildHeaders(apiKey: string, extra?: Record<string, string>): HeadersInit {
    return {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...extra,
    };
}

async function parseErrorResponse(response: Response): Promise<never> {
    let body: unknown;
    try {
        body = await response.json();
    } catch {
        body = await response.text().catch(() => undefined);
    }
    throw new OpenRouterError(openRouterErrorMessage(response.status, body), response.status, body);
}

export function createOpenRouterClient(options: OpenRouterClientOptions) {
    const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    const httpFetch = options.fetch ?? fetch;
    const defaultHeaders = options.defaultHeaders ?? {};

    async function postCompletions(
        body: ChatCompletionRequest,
        requestOptions?: ChatRequestOptions,
    ): Promise<Response> {
        const response = await httpFetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: buildHeaders(options.apiKey, defaultHeaders),
            body: JSON.stringify(body),
            signal: requestOptions?.signal,
        });
        if (!response.ok) {
            await parseErrorResponse(response);
        }
        return response;
    }

    return {
        async chat(
            req: ChatCompletionRequest,
            requestOptions?: ChatRequestOptions,
        ): Promise<ChatMessage> {
            const response = await postCompletions({ ...req, stream: false }, requestOptions);
            const data = (await response.json()) as CompletionResponse;
            const message = data.choices?.[0]?.message;
            if (!message) {
                throw new OpenRouterError('OpenRouter returned no choices', 502, data);
            }
            return parseAssistantMessage(message);
        },

        async *chatStream(
            req: ChatCompletionRequest,
            requestOptions?: ChatRequestOptions,
        ): AsyncIterable<ChatStreamChunk> {
            const response = await postCompletions({ ...req, stream: true }, requestOptions);
            if (!response.body) {
                throw new OpenRouterError('OpenRouter stream has no body', 502);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            const toolCalls = new Map<number, ToolCall>();
            let content = '';

            const flushDelta = (
                delta: StreamDelta['choices'] extends (infer U)[] | undefined ? U : never,
            ) => {
                if (delta.delta?.content) {
                    content += delta.delta.content;
                    return { type: 'content' as const, content: delta.delta.content };
                }
                if (delta.delta?.tool_calls?.length) {
                    for (const tc of delta.delta.tool_calls) {
                        const existing = toolCalls.get(tc.index) ?? {
                            id: '',
                            type: 'function' as const,
                            function: { name: '', arguments: '' },
                        };
                        if (tc.id) {
                            existing.id = tc.id;
                        }
                        if (tc.function?.name) {
                            existing.function.name = tc.function.name;
                        }
                        if (tc.function?.arguments) {
                            existing.function.arguments += tc.function.arguments;
                        }
                        toolCalls.set(tc.index, existing);
                    }
                    return {
                        type: 'tool_call_delta' as const,
                        delta: delta.delta.tool_calls[0]!,
                    };
                }
                return null;
            };

            try {
                while (true) {
                    if (requestOptions?.signal?.aborted) {
                        throw new DOMException('The operation was aborted.', 'AbortError');
                    }
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() ?? '';

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed || trimmed === 'data: [DONE]') {
                            continue;
                        }
                        if (!trimmed.startsWith('data: ')) {
                            continue;
                        }
                        const payload = JSON.parse(trimmed.slice(6)) as StreamDelta;
                        const choice = payload.choices?.[0];
                        if (!choice) {
                            continue;
                        }
                        const chunk = flushDelta(choice);
                        if (chunk) {
                            yield chunk;
                        }
                    }
                }
            } finally {
                try {
                    reader.releaseLock();
                } catch {
                    /* already released */
                }
            }

            const calls = [...toolCalls.values()].filter((tc) => tc.id);
            yield {
                type: 'done',
                message: {
                    role: 'assistant',
                    content: content || null,
                    ...(calls.length ? { tool_calls: calls } : {}),
                },
            };
        },
    };
}
