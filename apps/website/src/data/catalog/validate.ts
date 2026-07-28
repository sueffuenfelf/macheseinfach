import { areas } from './areas';
import { stories } from './stories';
import { catalogTags } from './tags';
import { tools } from './tools';
import { getAllToolVariants } from '../../tools/variant-registry';
import { isVariantFlowId } from './variant-stories';
import type {
    AreaId,
    CatalogValidationIssue,
    CatalogValidationResult,
    FlowDefinition,
    FlowSlotKind,
    StoryId,
    ToolId,
} from './types';
import { FLOW_SLOT_KINDS } from './types';

function issue(code: string, message: string): CatalogValidationIssue {
    return { code, message };
}

const SLOT_KIND_SET = new Set<string>(FLOW_SLOT_KINDS);

/** Documented shell / bespoke input keys — field ids validated when discoverable (P1+) */
const DOCUMENTED_INPUT_KEYS = new Set([
    'file',
    'files',
    'image',
    'paste',
    'source',
    'pdf',
    'text',
    'iban',
    'amount',
    'currency',
    'date',
    'password',
    'json',
    'url',
    'enum',
]);

function flowStepToolIds(flow: FlowDefinition): ToolId[] {
    return flow.steps.map((s) => s.toolId);
}

function flowAllToolIds(flow: FlowDefinition): ToolId[] {
    return [...flowStepToolIds(flow), ...(flow.recommended ?? []).map((r) => r.toolId)];
}

function isAuthoredMultiTool(flow: FlowDefinition): boolean {
    return (
        flow.context.slots.length > 0 ||
        (flow.recommended?.length ?? 0) > 0 ||
        Object.keys(flow.stepBindings).length > 0
    );
}

function validateFlowDefinition(flow: FlowDefinition, issues: CatalogValidationIssue[]): void {
    const isVariant = isVariantFlowId(flow.id);

    // FLOW_MIN_STEPS — ≥2 except Variant-SEO; legacy 1:1 Direkt-Stories exempt until authored
    if (!isVariant && flow.steps.length < 2 && isAuthoredMultiTool(flow)) {
        issues.push(
            issue(
                'FLOW_MIN_STEPS',
                `Flow ${flow.id} braucht mindestens 2 Steps (hat ${flow.steps.length})`,
            ),
        );
    }

    const stepToolSet = new Set<string>();
    for (const step of flow.steps) {
        if (stepToolSet.has(step.toolId)) {
            issues.push(
                issue('FLOW_STEP_DUP', `Flow ${flow.id} hat doppelten Step-Tool ${step.toolId}`),
            );
        }
        stepToolSet.add(step.toolId);

        if (!tools[step.toolId as ToolId]) {
            issues.push(
                issue(
                    'FLOW_STEP_UNKNOWN',
                    `Flow ${flow.id} referenziert unbekanntes Step-Tool ${step.toolId}`,
                ),
            );
        }
    }

    const recToolSet = new Set<string>();
    for (const rec of flow.recommended ?? []) {
        if (recToolSet.has(rec.toolId)) {
            issues.push(
                issue(
                    'FLOW_REC_DUP',
                    `Flow ${flow.id} hat doppeltes Recommended-Tool ${rec.toolId}`,
                ),
            );
        }
        recToolSet.add(rec.toolId);

        if (!tools[rec.toolId as ToolId]) {
            issues.push(
                issue(
                    'REC_UNKNOWN',
                    `Flow ${flow.id} referenziert unbekanntes Recommended-Tool ${rec.toolId}`,
                ),
            );
        }

        if (stepToolSet.has(rec.toolId)) {
            issues.push(
                issue(
                    'FLOW_REC_DUP_STEP',
                    `Flow ${flow.id}: Recommended-Tool ${rec.toolId} ist auch Step`,
                ),
            );
        }
    }

    const slotIds = new Set<string>();
    for (const slot of flow.context.slots) {
        if (slotIds.has(slot.id)) {
            issues.push(
                issue('FLOW_SLOT_ID_DUP', `Flow ${flow.id} hat doppelte Slot-Id „${slot.id}“`),
            );
        }
        slotIds.add(slot.id);

        if (!SLOT_KIND_SET.has(slot.kind)) {
            issues.push(
                issue(
                    'FLOW_SLOT_KIND',
                    `Flow ${flow.id} Slot „${slot.id}“ hat ungültiges Kind „${slot.kind}“`,
                ),
            );
        }

        if (slot.kind === 'enum' && (!slot.options || slot.options.length === 0)) {
            issues.push(
                issue('FLOW_SLOT_KIND', `Flow ${flow.id} enum-Slot „${slot.id}“ braucht options`),
            );
        }

        const fileKinds: FlowSlotKind[] = ['file', 'files', 'image'];
        if (slot.accept && !fileKinds.includes(slot.kind)) {
            issues.push(
                issue(
                    'FLOW_SLOT_KIND',
                    `Flow ${flow.id} Slot „${slot.id}“: accept nur für file/files/image`,
                ),
            );
        }

        if (slot.kind === 'password' && slot.persist !== undefined && slot.persist !== 'never') {
            issues.push(
                issue(
                    'FLOW_PASSWORD_PERSIST',
                    `Flow ${flow.id} password-Slot „${slot.id}“ muss persist: 'never' haben`,
                ),
            );
        }

        if (slot.kind === 'password' && slot.persist === undefined) {
            issues.push(
                issue(
                    'FLOW_PASSWORD_PERSIST',
                    `Flow ${flow.id} password-Slot „${slot.id}“ muss persist: 'never' explizit setzen`,
                ),
            );
        }
    }

    const allowedBindingTools = new Set(flowAllToolIds(flow));
    for (const [toolId, bindings] of Object.entries(flow.stepBindings)) {
        if (!allowedBindingTools.has(toolId)) {
            issues.push(
                issue(
                    'FLOW_BINDING_UNKNOWN_TOOL',
                    `Flow ${flow.id}: Binding für Tool ${toolId}, das weder Step noch Recommended ist`,
                ),
            );
        }

        for (const [inputKey, slotId] of Object.entries(bindings)) {
            if (!slotIds.has(slotId)) {
                issues.push(
                    issue(
                        'FLOW_BINDING_UNKNOWN_SLOT',
                        `Flow ${flow.id}: Binding ${toolId}.${inputKey} → unbekannter Slot „${slotId}“`,
                    ),
                );
            }

            // Soft: known documented keys OK; unknown keys flagged for Shell/bespoke review
            if (!DOCUMENTED_INPUT_KEYS.has(inputKey)) {
                // Allow field-like camelCase ids (shell FieldDef.id) without hard-fail until P1 registry
                if (!/^[a-z][a-zA-Z0-9]*$/.test(inputKey)) {
                    issues.push(
                        issue(
                            'FLOW_BINDING_INPUT_KEY',
                            `Flow ${flow.id}: Binding-InputKey „${inputKey}“ für ${toolId} ist ungültig`,
                        ),
                    );
                }
            }
        }
    }

    // FLOW_CROSS_AREA_OK — intentionally no check: tools may be outside flow.areaIds

    // FLOW_TOOL_SYNC — bidirectional storyIds ↔ steps (+ recommended)
    for (const toolId of flowAllToolIds(flow)) {
        const tool = tools[toolId as ToolId];
        if (!tool) continue;
        if (!tool.storyIds.includes(flow.id)) {
            issues.push(
                issue('FLOW_TOOL_SYNC', `Tool ${toolId} listet Flow ${flow.id} nicht in storyIds`),
            );
        }
    }
}

/** Laufzeit-Validierung — ergänzt TypeScript satisfies; in Tests & CI */
export function validateCatalog(): CatalogValidationResult {
    const issues: CatalogValidationIssue[] = [];

    const areaSlugs = new Set<string>();
    for (const area of Object.values(areas)) {
        if (areaSlugs.has(area.slug)) {
            issues.push(issue('DUPLICATE_AREA_SLUG', `Doppelter Bereichs-Slug „${area.slug}“`));
        }
        areaSlugs.add(area.slug);
    }

    const storySlugs = new Set<string>();
    for (const story of Object.values(stories)) {
        if (storySlugs.has(story.slug)) {
            issues.push(issue('DUPLICATE_STORY_SLUG', `Doppelter Story-Slug „${story.slug}“`));
        }
        storySlugs.add(story.slug);
    }

    for (const variant of getAllToolVariants()) {
        if (storySlugs.has(variant.slug)) {
            issues.push(
                issue(
                    'VARIANT_STORY_SLUG_CONFLICT',
                    `Variant-Slug „${variant.slug}“ kollidiert mit Story-Slug`,
                ),
            );
        }
        if (!tools[variant.toolId as ToolId]) {
            issues.push(
                issue(
                    'VARIANT_UNKNOWN_TOOL',
                    `Variant „${variant.slug}“ referenziert unbekanntes Tool ${variant.toolId}`,
                ),
            );
        }
    }

    const toolSlugs = new Set<string>();
    for (const tool of Object.values(tools)) {
        if (toolSlugs.has(tool.slug)) {
            issues.push(issue('DUPLICATE_TOOL_SLUG', `Doppelter Tool-Slug „${tool.slug}“`));
        }
        toolSlugs.add(tool.slug);
    }

    for (const area of Object.values(areas)) {
        for (const storyId of area.storyIds) {
            const story = stories[storyId as StoryId];
            if (!story) {
                issues.push(
                    issue(
                        'AREA_UNKNOWN_STORY',
                        `Area ${area.id} referenziert unbekannte Story ${storyId}`,
                    ),
                );
                continue;
            }
            if (!(story.areaIds as readonly AreaId[]).includes(area.id)) {
                issues.push(
                    issue(
                        'AREA_STORY_MISMATCH',
                        `Story ${storyId} ist nicht in areaIds für Bereich ${area.id}`,
                    ),
                );
            }
        }
    }

    for (const story of Object.values(stories)) {
        for (const areaId of story.areaIds) {
            const area = areas[areaId as AreaId];
            if (!area) {
                issues.push(
                    issue(
                        'STORY_UNKNOWN_AREA',
                        `Story ${story.id} referenziert unbekannten Bereich ${areaId}`,
                    ),
                );
                continue;
            }
            if (!(area.storyIds as readonly StoryId[]).includes(story.id)) {
                issues.push(
                    issue(
                        'STORY_AREA_MISSING',
                        `Bereich ${areaId} listet Story ${story.id} nicht in storyIds`,
                    ),
                );
            }
        }

        validateFlowDefinition(story, issues);
    }

    for (const tool of Object.values(tools)) {
        for (const tag of tool.tags) {
            if (!catalogTags[tag as keyof typeof catalogTags]) {
                issues.push(
                    issue('TOOL_UNKNOWN_TAG', `Tool ${tool.id} nutzt unregistrierten Tag „${tag}“`),
                );
            }
        }

        if (tool.areas.length === 0) {
            issues.push(issue('TOOL_NO_AREAS', `Tool ${tool.id} hat keine areas`));
        }

        for (const areaId of tool.areas) {
            if (!areas[areaId as AreaId]) {
                issues.push(
                    issue(
                        'TOOL_UNKNOWN_AREA',
                        `Tool ${tool.id} referenziert unbekannten Bereich ${areaId}`,
                    ),
                );
            }
        }

        // TOOL_DIRECT_OK — storyIds.length === 0 is allowed (Direkt-Tool)
        for (const storyId of tool.storyIds) {
            const story = stories[storyId as StoryId];
            if (!story) {
                issues.push(
                    issue(
                        'TOOL_UNKNOWN_STORY',
                        `Tool ${tool.id} referenziert unbekannte Story ${storyId}`,
                    ),
                );
                continue;
            }
            const listed = flowAllToolIds(story).includes(tool.id);
            if (!listed) {
                issues.push(
                    issue(
                        'FLOW_TOOL_SYNC',
                        `Flow ${storyId} listet Tool ${tool.id} weder in steps noch recommended`,
                    ),
                );
            }
        }
    }

    return { ok: issues.length === 0, issues };
}

export function assertCatalogValid(): void {
    const result = validateCatalog();
    if (!result.ok) {
        const lines = result.issues.map((i) => `[${i.code}] ${i.message}`).join('\n');
        throw new Error(`Catalog validation failed:\n${lines}`);
    }
}
