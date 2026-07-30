import { describe, expect, test } from 'bun:test';
import type { ChatMessage, OpenRouterClient } from '@macheseinfach/openrouter';
import type { AssistantEvent } from './events';
import type { AssistantHost } from './host';
import { buildSystemPrompt } from './system-prompt';
import { buildTurnMessages, runAssistantTurn } from './loop';
import { META_TOOLS } from './meta-tools';
import type { AssistantThread, ToolHit } from './types';

function createThread(): AssistantThread {
    const now = Date.now();
    return {
        id: 'thread-1',
        title: 'Test',
        createdAt: now,
        updatedAt: now,
        messages: [
            {
                id: 'msg-1',
                role: 'user',
                content: 'Welche Bereiche gibt es?',
                createdAt: now,
            },
        ],
        attachmentIds: [],
    };
}

function createFakeHost(overrides: Partial<AssistantHost> = {}): AssistantHost {
    const areas = [{ id: 'finance', label: 'Finanzen', description: 'Geld-Tools', toolCount: 2 }];
    const tools: ToolHit[] = [
        { id: 'iban-check', title: 'IBAN prüfen', sub: 'Validierung', areaId: 'finance' },
    ];

    return {
        listAreas: () => areas,
        getArea: (areaId) => (areaId === 'finance' ? { ...areas[0]!, tools } : null),
        listFlows: () => [],
        getFlow: () => null,
        searchTools: (query) =>
            tools.filter((t) => t.title.toLowerCase().includes(query.toLowerCase())),
        getTool: (toolId) => tools.find((t) => t.id === toolId) ?? null,
        listFavorites: () => tools,
        runTool: async () => ({ ok: true, summary: 'done' }),
        openFlow: () => {},
        openTool: async () => {},
        requestUserInput: async () => ({ cancelled: true }),
        resolveAttachment: async () => null,
        ...overrides,
    };
}

function createScriptedClient(responses: ChatMessage[]): OpenRouterClient {
    let call = 0;
    return {
        chat: async () => {
            const next = responses[call];
            call += 1;
            if (!next) {
                throw new Error(`No scripted response for call ${call}`);
            }
            return next;
        },
        chatStream: async function* () {
            throw new Error('not implemented in tests');
        },
    };
}

describe('META_TOOLS', () => {
    test('defines all planned meta-tools', () => {
        const names = META_TOOLS.map((t) => t.name);
        expect(names).toEqual([
            'list_areas',
            'get_area',
            'list_flows',
            'get_flow',
            'search_tools',
            'get_tool',
            'list_favorites',
            'request_user_input',
            'attach_from_chat',
            'run_tool',
            'open_flow',
            'open_tool',
        ]);
    });
});

describe('buildSystemPrompt', () => {
    test('includes favorites in German system prompt', () => {
        const prompt = buildSystemPrompt({
            locale: 'de',
            favorites: [{ id: 'iban-check', title: 'IBAN prüfen' }],
        });
        expect(prompt).toContain('Favoriten des Nutzers: IBAN prüfen (iban-check)');
        expect(prompt).toContain('macheseinfa.ch');
    });
});

describe('buildTurnMessages', () => {
    test('prepends system prompt with favorites', () => {
        const messages = buildTurnMessages({
            thread: createThread(),
            favorites: [{ id: 'iban-check', title: 'IBAN prüfen' }],
        });
        expect(messages[0]?.role).toBe('system');
        expect(messages[0]?.content).toContain('IBAN prüfen');
        expect(messages.at(-1)?.role).toBe('user');
    });
});

describe('runAssistantTurn', () => {
    test('runs two tool rounds then finishes with assistant text', async () => {
        const events: AssistantEvent[] = [];
        const thread = createThread();
        const host = createFakeHost();
        const client = createScriptedClient([
            {
                role: 'assistant',
                content: null,
                tool_calls: [
                    {
                        id: 'call-1',
                        type: 'function',
                        function: { name: 'list_areas', arguments: '{}' },
                    },
                ],
            },
            {
                role: 'assistant',
                content: null,
                tool_calls: [
                    {
                        id: 'call-2',
                        type: 'function',
                        function: {
                            name: 'search_tools',
                            arguments: '{"query":"iban"}',
                        },
                    },
                ],
            },
            { role: 'assistant', content: 'Hier ist ein passendes Tool: IBAN prüfen.' },
        ]);

        await runAssistantTurn({
            client,
            model: 'test-model',
            thread,
            host,
            favorites: host.listFavorites(),
            onEvent: (e) => events.push(e),
        });

        const toolStarts = events.filter((e) => e.type === 'tool_start');
        expect(toolStarts).toHaveLength(2);
        expect(toolStarts[0]?.name).toBe('list_areas');
        expect(toolStarts[1]?.name).toBe('search_tools');
        expect(events.some((e) => e.type === 'done')).toBe(true);
        expect(thread.messages.at(-1)?.content).toContain('IBAN prüfen');
    });

    test('stops after maxToolRounds', async () => {
        const thread = createThread();
        const host = createFakeHost();
        const endlessTools: ChatMessage = {
            role: 'assistant',
            content: null,
            tool_calls: [
                {
                    id: 'call-loop',
                    type: 'function',
                    function: { name: 'list_areas', arguments: '{}' },
                },
            ],
        };
        const client = createScriptedClient([endlessTools, endlessTools, endlessTools]);

        await runAssistantTurn({
            client,
            model: 'test-model',
            thread,
            host,
            favorites: [],
            maxToolRounds: 1,
            onEvent: () => {},
        });

        expect(thread.messages.at(-1)?.content).toContain('Maximale Anzahl');
    });

    test('returns cancelled result for request_user_input', async () => {
        const events: AssistantEvent[] = [];
        const thread = createThread();
        const host = createFakeHost({
            requestUserInput: async () => ({ cancelled: true }),
        });
        const client = createScriptedClient([
            {
                role: 'assistant',
                content: null,
                tool_calls: [
                    {
                        id: 'call-input',
                        type: 'function',
                        function: {
                            name: 'request_user_input',
                            arguments:
                                '{"kind":"file","prompt":"Bitte PDF hochladen","accept":"application/pdf"}',
                        },
                    },
                ],
            },
            { role: 'assistant', content: 'Okay, ohne Datei kann ich nicht weitermachen.' },
        ]);

        await runAssistantTurn({
            client,
            model: 'test-model',
            thread,
            host,
            favorites: [],
            onEvent: (e) => events.push(e),
        });

        const toolEnd = events.find(
            (e) => e.type === 'tool_end' && e.name === 'request_user_input',
        );
        expect(toolEnd?.result).toContain('cancelled');
        const toolMsg = thread.messages.find(
            (m) => m.role === 'tool' && m.name === 'request_user_input',
        );
        expect(toolMsg?.content).toContain('cancelled');
    });

    test('streams assistant tokens when stream option is enabled', async () => {
        const events: AssistantEvent[] = [];
        const thread = createThread();
        const host = createFakeHost();
        const client: OpenRouterClient = {
            chat: async () => {
                throw new Error('chat should not be called when streaming');
            },
            chatStream: async function* () {
                yield { type: 'content', content: 'Hallo' };
                yield { type: 'content', content: ' Welt' };
                yield {
                    type: 'done',
                    message: { role: 'assistant', content: 'Hallo Welt' },
                };
            },
        };

        await runAssistantTurn({
            client,
            model: 'test-model',
            thread,
            host,
            favorites: [],
            stream: true,
            onEvent: (e) => events.push(e),
        });

        expect(events.filter((e) => e.type === 'stream').length).toBe(2);
        expect(thread.messages.at(-1)?.content).toBe('Hallo Welt');
    });

    test('unknown tool returns error tool result', async () => {
        const thread = createThread();
        const host = createFakeHost();
        const client = createScriptedClient([
            {
                role: 'assistant',
                content: null,
                tool_calls: [
                    {
                        id: 'call-bad',
                        type: 'function',
                        function: { name: 'not_a_real_tool', arguments: '{}' },
                    },
                ],
            },
            { role: 'assistant', content: 'Entschuldigung.' },
        ]);

        await runAssistantTurn({
            client,
            model: 'test-model',
            thread,
            host,
            favorites: [],
            onEvent: () => {},
        });

        const toolMsg = thread.messages.find((m) => m.role === 'tool');
        expect(toolMsg?.content).toContain('Unknown tool');
    });
});
