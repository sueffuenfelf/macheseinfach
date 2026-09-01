import type {
    AssistantHost,
    AttachmentPayload,
    AttachmentRef,
    ToolHit,
    ToolRunResult,
    UserInputRequest,
} from '@macheseinfach/assistant-core';
import type {
    AssistantPersistence,
    AssistantThread,
    ChatAttachment,
} from '@macheseinfach/assistant-core';
import type { ToolId } from '../data/catalog';
import {
    areaOrder,
    areas,
    getTool,
    searchTools as catalogSearchTools,
    toolsInArea,
    type ToolDefinition,
} from '../data/catalog';
import { attachmentToFile, saveFileAttachment, saveTextAttachment } from './attachment-service';
import { runCatalogTool } from './shellRunner';
import { setPasteTextPrefill, setToolFilePrefill, setToolScalarPrefill } from './tool-prefill';

export type UserInputResolver = (
    req: UserInputRequest,
) => Promise<AttachmentRef | { cancelled: true }>;

export type AssistantHostDeps = {
    favoriteIds: ToolId[];
    selectTool: (toolId: ToolId) => void;
    navigateToTool: (toolId: ToolId) => void;
    persistence: AssistantPersistence;
    getThread: () => AssistantThread;
    updateThread: (patch: Partial<AssistantThread>) => void;
    requestUserInput: UserInputResolver;
};

function toolToHit(tool: ToolDefinition): ToolHit {
    return {
        id: tool.id,
        title: tool.shortTitle || tool.title,
        sub: tool.sub,
        areaId: tool.areas[0],
        tags: [...tool.tags],
    };
}

function attachmentToRef(attachment: ChatAttachment): AttachmentRef {
    return {
        attachmentId: attachment.id,
        name: attachment.name,
        kind: attachment.kind,
        mime: attachment.mime,
    };
}

function linkAttachmentToThread(deps: AssistantHostDeps, attachmentId: string): void {
    const thread = deps.getThread();
    if (thread.attachmentIds.includes(attachmentId)) return;
    deps.updateThread({
        attachmentIds: [...thread.attachmentIds, attachmentId],
    });
}

async function resolveInputAttachments(
    deps: AssistantHostDeps,
    input: Record<string, unknown>,
): Promise<Record<string, unknown>> {
    const thread = deps.getThread();
    const resolved: Record<string, unknown> = { ...input };

    for (const [key, value] of Object.entries(resolved)) {
        if (typeof value !== 'string' || !thread.attachmentIds.includes(value)) continue;
        const payload = await deps.persistence.attachments.get(value);
        if (!payload) continue;

        if (payload.kind === 'text') {
            resolved[key] = payload.text ?? '';
            continue;
        }

        const file = await attachmentToFile(payload, deps.persistence.blobs);
        if (file) {
            resolved[key] = file;
        }
    }

    return resolved;
}

async function applyToolPrefill(
    deps: AssistantHostDeps,
    toolId: ToolId,
    prefill: Record<string, unknown>,
): Promise<void> {
    const resolved = await resolveInputAttachments(deps, prefill);
    const scalars: Record<string, string> = {};
    let pendingFile: File | undefined;
    let pasteText: string | undefined;

    for (const [key, value] of Object.entries(resolved)) {
        if (value instanceof File) {
            pendingFile = value;
            continue;
        }
        if (typeof value === 'string') {
            if (key === 'paste' || key === 'text' || key === 'input') {
                pasteText = value;
            } else {
                scalars[key] = value;
            }
            continue;
        }
        if (typeof value === 'number' || typeof value === 'boolean') {
            scalars[key] = String(value);
        }
    }

    if (Object.keys(scalars).length) {
        setToolScalarPrefill(toolId, scalars);
    }
    if (pendingFile) {
        setToolFilePrefill(toolId, pendingFile);
    }
    if (pasteText) {
        setPasteTextPrefill(toolId, pasteText);
    }
}

export function createAssistantHost(deps: AssistantHostDeps): AssistantHost {
    return {
        listAreas() {
            return areaOrder.map((id) => {
                const area = areas[id];
                return {
                    id: area.id,
                    label: area.label,
                    description: area.description,
                    toolCount: toolsInArea(id).length,
                };
            });
        },

        getArea(areaId) {
            const area = areas[areaId as keyof typeof areas];
            if (!area) return null;
            return {
                id: area.id,
                label: area.label,
                description: area.description,
                toolCount: toolsInArea(area.id).length,
                tools: toolsInArea(area.id).map(toolToHit),
            };
        },

        searchTools(query, opts) {
            const q = query.trim();
            if (!q) return [];
            let hits = catalogSearchTools(q);
            if (opts?.areaId) {
                hits = hits.filter((t) => t.areas.includes(opts.areaId as never));
            }
            const limit = opts?.limit ?? 10;
            return hits.slice(0, limit).map(toolToHit);
        },

        getTool(toolId) {
            const tool = getTool(toolId);
            if (!tool) return null;
            return {
                ...toolToHit(tool),
                description: tool.pain,
                inputSchema: { entry: tool.entry },
            };
        },

        listFavorites() {
            return deps.favoriteIds
                .map((id) => {
                    const tool = getTool(id);
                    return tool ? toolToHit(tool) : null;
                })
                .filter((hit): hit is ToolHit => hit !== null);
        },

        async runTool(toolId, input): Promise<ToolRunResult> {
            const tool = getTool(toolId);
            if (!tool) {
                return {
                    ok: false,
                    error: `Unbekanntes Tool: ${toolId}`,
                    summary: 'Tool-ID nicht im Katalog gefunden.',
                };
            }

            const rawInput =
                typeof input === 'object' && input !== null && !Array.isArray(input)
                    ? (input as Record<string, unknown>)
                    : {};

            const resolvedInput = await resolveInputAttachments(deps, rawInput);
            return runCatalogTool(toolId, resolvedInput);
        },

        async openTool(toolId, prefill) {
            const tool = getTool(toolId);
            if (!tool) return;
            if (prefill && typeof prefill === 'object' && !Array.isArray(prefill)) {
                await applyToolPrefill(deps, toolId as ToolId, prefill as Record<string, unknown>);
            }
            deps.navigateToTool(toolId as ToolId);
        },

        async requestUserInput(req) {
            const result = await deps.requestUserInput(req);
            if ('cancelled' in result) {
                return result;
            }
            linkAttachmentToThread(deps, result.attachmentId);
            return result;
        },

        async resolveAttachment(id): Promise<AttachmentPayload | null> {
            const thread = deps.getThread();
            if (!thread.attachmentIds.includes(id)) {
                return null;
            }
            return deps.persistence.attachments.get(id);
        },
    };
}

export async function addComposerTextAttachment(
    deps: Pick<AssistantHostDeps, 'persistence'>,
    text: string,
    name?: string,
): Promise<ChatAttachment> {
    return saveTextAttachment({
        store: deps.persistence.attachments,
        text,
        name: name ?? 'Eingefügter Text',
        source: 'user_upload',
    });
}

export async function addComposerAttachments(
    deps: Pick<AssistantHostDeps, 'persistence' | 'getThread' | 'updateThread'>,
    files: File[],
    options?: { linkToThread?: boolean },
): Promise<ChatAttachment[]> {
    const thread = deps.getThread();
    const created: ChatAttachment[] = [];

    for (const file of files) {
        const attachment = await saveFileAttachment({
            store: deps.persistence.attachments,
            blobs: deps.persistence.blobs,
            threadId: thread.id,
            file,
            source: 'user_upload',
        });
        created.push(attachment);
    }

    if (created.length && options?.linkToThread !== false) {
        deps.updateThread({
            attachmentIds: [
                ...thread.attachmentIds,
                ...created.map((a) => a.id).filter((id) => !thread.attachmentIds.includes(id)),
            ],
        });
    }

    return created;
}

export async function fulfillUserInputRequest(
    deps: Pick<AssistantHostDeps, 'persistence' | 'getThread' | 'updateThread'>,
    req: UserInputRequest,
    payload: { files?: File[]; text?: string },
): Promise<AttachmentRef> {
    const thread = deps.getThread();

    if (req.kind === 'text' || req.kind === 'multiline') {
        const text = payload.text?.trim() ?? '';
        if (!text) {
            throw new Error('Text fehlt.');
        }
        const attachment = await saveTextAttachment({
            store: deps.persistence.attachments,
            text,
            name: req.slotHint?.trim() || 'Texteingabe',
            source: 'user_prompt',
        });
        deps.updateThread({
            attachmentIds: [...thread.attachmentIds, attachment.id],
        });
        return attachmentToRef(attachment);
    }

    const files = payload.files ?? [];
    if (!files.length) {
        throw new Error('Datei fehlt.');
    }
    if (req.kind === 'file' && files.length > 1) {
        throw new Error('Nur eine Datei erlaubt.');
    }

    const attachment = await saveFileAttachment({
        store: deps.persistence.attachments,
        blobs: deps.persistence.blobs,
        threadId: thread.id,
        file: files[0],
        source: 'user_prompt',
    });
    deps.updateThread({
        attachmentIds: [...thread.attachmentIds, attachment.id],
    });
    return attachmentToRef(attachment);
}

export function removeThreadAttachment(
    deps: Pick<AssistantHostDeps, 'persistence' | 'getThread' | 'updateThread'>,
    attachmentId: string,
    options?: { skipThreadUpdate?: boolean },
): void {
    const thread = deps.getThread();
    deps.persistence.attachments.delete(attachmentId);
    if (options?.skipThreadUpdate) return;
    deps.updateThread({
        attachmentIds: thread.attachmentIds.filter((id) => id !== attachmentId),
    });
}
