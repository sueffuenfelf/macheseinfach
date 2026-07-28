import { afterEach, describe, expect, mock, test } from 'bun:test';
import { createOpenRouterClient, OpenRouterError, parseToolCalls } from './client';

const originalFetch = globalThis.fetch;

afterEach(() => {
    globalThis.fetch = originalFetch;
});

describe('parseToolCalls', () => {
    test('parses function tool_calls from API message', () => {
        const result = parseToolCalls({
            role: 'assistant',
            content: null,
            tool_calls: [
                {
                    id: 'call_abc',
                    type: 'function',
                    function: { name: 'list_areas', arguments: '{}' },
                },
            ],
        });
        expect(result).toEqual([
            {
                id: 'call_abc',
                type: 'function',
                function: { name: 'list_areas', arguments: '{}' },
            },
        ]);
    });

    test('returns undefined when no tool_calls', () => {
        expect(parseToolCalls({ role: 'assistant', content: 'hi' })).toBeUndefined();
    });
});

describe('createOpenRouterClient', () => {
    test('chat returns assistant message with tool_calls', async () => {
        const fetchMock = mock(async () =>
            Response.json({
                choices: [
                    {
                        message: {
                            role: 'assistant',
                            content: null,
                            tool_calls: [
                                {
                                    id: 'call_1',
                                    type: 'function',
                                    function: {
                                        name: 'search_tools',
                                        arguments: '{"query":"iban"}',
                                    },
                                },
                            ],
                        },
                    },
                ],
            }),
        );
        globalThis.fetch = fetchMock as typeof fetch;

        const client = createOpenRouterClient({ apiKey: 'test-key' });
        const message = await client.chat({
            model: 'anthropic/claude-sonnet-4',
            messages: [{ role: 'user', content: 'Finde IBAN Tool' }],
        });

        expect(message.role).toBe('assistant');
        expect(message.tool_calls).toHaveLength(1);
        expect(message.tool_calls?.[0]?.function.name).toBe('search_tools');
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(init.headers).toMatchObject({
            Authorization: 'Bearer test-key',
            'Content-Type': 'application/json',
        });
    });

    test('chat throws OpenRouterError on 401', async () => {
        globalThis.fetch = mock(async () =>
            Response.json({ error: { message: 'Invalid API key' } }, { status: 401 }),
        ) as typeof fetch;

        const client = createOpenRouterClient({ apiKey: 'bad-key' });
        await expect(
            client.chat({
                model: 'test',
                messages: [{ role: 'user', content: 'hi' }],
            }),
        ).rejects.toMatchObject({
            name: 'OpenRouterError',
            status: 401,
            message: 'OpenRouter API key is invalid or missing (401)',
        });
    });

    test('uses custom baseUrl', async () => {
        const fetchMock = mock(async () =>
            Response.json({
                choices: [{ message: { role: 'assistant', content: 'ok' } }],
            }),
        );
        globalThis.fetch = fetchMock as typeof fetch;

        const client = createOpenRouterClient({
            apiKey: 'k',
            baseUrl: 'https://custom.example/v1/',
        });
        await client.chat({ model: 'm', messages: [{ role: 'user', content: 'x' }] });
        expect(fetchMock.mock.calls[0]?.[0]).toBe('https://custom.example/v1/chat/completions');
    });
});
