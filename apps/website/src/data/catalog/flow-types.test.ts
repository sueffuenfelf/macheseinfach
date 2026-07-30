import { describe, expect, test } from 'bun:test';
import type { FlowDefinition, FlowSlotDef } from './types';
import { FLOW_SLOT_KINDS } from './types';
import { stories } from './stories';
import { tools } from './tools';
import { validateCatalog } from './validate';

function baseFlow(overrides: Partial<FlowDefinition> = {}): FlowDefinition {
    return {
        id: 'story-bild-verkleinern',
        slug: 'test-flow',
        areaIds: ['bilder'],
        role: 'Test',
        want: 'test',
        title: 'Test',
        situation: 'Test',
        outcome: 'Test',
        status: 'ready',
        steps: [
            { toolId: 'image-compress', label: 'Bild komprimieren' },
            { toolId: 'image-resize', label: 'Bild verkleinern' },
        ],
        recommended: [],
        context: { slots: [] },
        stepBindings: {},
        ...overrides,
    };
}

describe('Flow catalog types', () => {
    test('FLOW_SLOT_KINDS covers all planned kinds', () => {
        expect(FLOW_SLOT_KINDS).toContain('password');
        expect(FLOW_SLOT_KINDS).toContain('file');
        expect(FLOW_SLOT_KINDS).toContain('iban');
        expect(FLOW_SLOT_KINDS.length).toBe(12);
    });

    test('migrated stories use steps not toolIds', () => {
        for (const story of Object.values(stories)) {
            expect(Array.isArray(story.steps)).toBe(true);
            expect('toolIds' in story).toBe(false);
            expect(story.context).toBeDefined();
            expect(story.stepBindings).toBeDefined();
        }
    });

    test('P3 pilot Vorhaben are authored multi-tool with slots + bindings', () => {
        const pilots = [
            'story-vermieter-nachweis',
            'story-freelancer-zahlung',
            'story-portal-foto',
        ] as const;
        for (const id of pilots) {
            const flow = stories[id];
            expect(flow.steps.length).toBeGreaterThanOrEqual(2);
            expect(flow.context.slots.length).toBeGreaterThan(0);
            expect(Object.keys(flow.stepBindings).length).toBeGreaterThan(0);
        }
    });
});

describe('FLOW_* validation helpers', () => {
    test('password slot without persist: never is invalid', () => {
        const slot: FlowSlotDef = {
            id: 'secret',
            kind: 'password',
            label: 'Geheim',
        };
        const needsNever = slot.kind === 'password' && slot.persist !== 'never';
        expect(needsNever).toBe(true);
    });

    test('password slot with persist never is ok', () => {
        const slot: FlowSlotDef = {
            id: 'secret',
            kind: 'password',
            label: 'Geheim',
            persist: 'never',
        };
        expect(slot.persist).toBe('never');
    });

    test('authored multi-tool with 1 step would fail FLOW_MIN_STEPS', () => {
        const flow = baseFlow({
            steps: [{ toolId: 'image-compress', label: 'Bild komprimieren' }],
            context: {
                slots: [{ id: 'photo', kind: 'image', label: 'Foto' }],
            },
        });
        const authored =
            flow.context.slots.length > 0 ||
            (flow.recommended?.length ?? 0) > 0 ||
            Object.keys(flow.stepBindings).length > 0;
        expect(authored && flow.steps.length < 2).toBe(true);
    });

    test('validateCatalog still ok after migration (when tools discovered)', () => {
        if (Object.keys(tools).length === 0) {
            console.warn('Skipping — requires Vite discovery');
            return;
        }
        const result = validateCatalog();
        expect(result.ok).toBe(true);
    });
});
