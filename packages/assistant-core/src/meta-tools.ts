export const META_TOOLS = [
    {
        name: 'list_areas',
        description: 'List all tool areas (Bereiche) with id, label, description, toolCount.',
        parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
    {
        name: 'get_area',
        description: 'Get one area and a compact list of tools in that area (id, title, sub).',
        parameters: {
            type: 'object',
            required: ['areaId'],
            properties: { areaId: { type: 'string' } },
        },
    },
    {
        name: 'list_flows',
        description: 'List Vorhaben (flows): multi-tool journeys. Filter by areaId optional.',
        parameters: {
            type: 'object',
            properties: {
                areaId: { type: 'string' },
                query: { type: 'string' },
            },
        },
    },
    {
        name: 'get_flow',
        description: 'Get one flow with steps[], recommended[], and context slot schema.',
        parameters: {
            type: 'object',
            required: ['flowId'],
            properties: { flowId: { type: 'string' } },
        },
    },
    {
        name: 'search_tools',
        description:
            'Search tools by query / tags / area. Returns top matches (never dump full catalog).',
        parameters: {
            type: 'object',
            required: ['query'],
            properties: {
                query: { type: 'string' },
                areaId: { type: 'string' },
                limit: { type: 'number' },
            },
        },
    },
    {
        name: 'get_tool',
        description: 'Get tool metadata + input schema summary for run_tool.',
        parameters: {
            type: 'object',
            required: ['toolId'],
            properties: { toolId: { type: 'string' } },
        },
    },
    {
        name: 'list_favorites',
        description:
            "List the user's favorite tools (always available; also injected in system prompt).",
        parameters: { type: 'object', properties: {} },
    },
    {
        name: 'request_user_input',
        description:
            'Ask the user for a file or text needed for a later run_tool. Blocks until user provides or cancels. Returns an attachmentId.',
        parameters: {
            type: 'object',
            required: ['kind', 'prompt'],
            properties: {
                kind: { type: 'string', enum: ['file', 'files', 'text', 'multiline'] },
                prompt: { type: 'string', description: 'German instruction shown to the user' },
                accept: { type: 'string', description: 'e.g. application/pdf,.pdf' },
                slotHint: { type: 'string', description: 'logical name e.g. sourcePdf' },
            },
        },
    },
    {
        name: 'attach_from_chat',
        description: 'Reference a file/text already uploaded in this thread (by attachmentId).',
        parameters: {
            type: 'object',
            required: ['attachmentId'],
            properties: { attachmentId: { type: 'string' } },
        },
    },
    {
        name: 'run_tool',
        description:
            'Execute a catalog tool locally in the browser. Pass inputs as JSON; file inputs as attachmentId refs.',
        parameters: {
            type: 'object',
            required: ['toolId', 'input'],
            properties: {
                toolId: { type: 'string' },
                input: { type: 'object' },
                openInUi: {
                    type: 'boolean',
                    description: 'If true, navigate/open the tool UI with prefilled context',
                },
            },
        },
    },
    {
        name: 'open_flow',
        description: 'Open a Vorhaben (flow) workspace in the UI, optionally with prefilled slots.',
        parameters: {
            type: 'object',
            required: ['flowId'],
            properties: {
                flowId: { type: 'string' },
                slotValues: { type: 'object' },
            },
        },
    },
    {
        name: 'open_tool',
        description:
            'Open a catalog tool in the UI. Optional prefill: field keys with text or attachmentId refs for files.',
        parameters: {
            type: 'object',
            required: ['toolId'],
            properties: {
                toolId: { type: 'string' },
                prefill: { type: 'object' },
            },
        },
    },
] as const;

export type MetaToolName = (typeof META_TOOLS)[number]['name'];

import type { ToolDefinition } from '@macheseinfach/openrouter';

export function metaToolsToDefinitions(): ToolDefinition[] {
    return META_TOOLS.map((tool) => ({
        type: 'function' as const,
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters as Record<string, unknown>,
        },
    }));
}

export const META_TOOL_NAMES = new Set<string>(META_TOOLS.map((t) => t.name));
