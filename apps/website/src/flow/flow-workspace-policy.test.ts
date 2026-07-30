import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { stories } from '../data/catalog/stories';
import type { FlowDefinition, FlowSlotDef, StoryId } from '../data/catalog/types';
import {
    firstRequiredStep,
    hasAnySlotSet,
    isSideQuestTool,
    isSlotFilled,
    missingRequiredSlots,
    nextStepAfter,
    shouldUseFlowWorkspace,
    stepProgress,
    validateFileForSlot,
} from './flow-workspace-policy';

const STORAGE_KEY = 'msf.flowWorkspace';

beforeAll(() => {
    if (typeof globalThis.localStorage === 'undefined') {
        const store = new Map<string, string>();
        globalThis.localStorage = {
            getItem: (k: string) => store.get(k) ?? null,
            setItem: (k: string, v: string) => {
                store.set(k, String(v));
            },
            removeItem: (k: string) => {
                store.delete(k);
            },
            clear: () => store.clear(),
            key: () => null,
            get length() {
                return store.size;
            },
        } as Storage;
    }
});

function fixtureFlow(overrides: Partial<FlowDefinition> = {}): FlowDefinition {
    return {
        id: 'story-elster-pdf-limit',
        slug: 'test-multi',
        areaIds: ['behoerden'],
        role: 'Test',
        want: 'test',
        title: 'Test Flow',
        situation: 'Situation',
        outcome: 'Outcome',
        status: 'ready',
        steps: [
            { toolId: 'pdf-compress', label: 'Verkleinern' },
            { toolId: 'pdf-redact', label: 'Schwärzen', optional: true },
        ],
        recommended: [{ toolId: 'pdf-merge', reason: 'Danach zusammenfügen' }],
        context: {
            slots: [
                { id: 'doc', kind: 'file', label: 'Dokument', required: true },
                { id: 'note', kind: 'text', label: 'Notiz' },
            ],
        },
        stepBindings: {
            'pdf-compress': { file: 'doc' },
        },
        ...overrides,
    };
}

describe('shouldUseFlowWorkspace', () => {
    afterEach(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            /* ignore */
        }
    });

    test('flag off → false even for multi-step', () => {
        localStorage.setItem(STORAGE_KEY, '0');
        expect(shouldUseFlowWorkspace(fixtureFlow())).toBe(false);
    });

    test('flag on + multi-step → true', () => {
        expect(shouldUseFlowWorkspace(fixtureFlow())).toBe(true);
    });

    test('flag on + 1-step → false (legacy path)', () => {
        localStorage.setItem(STORAGE_KEY, '1');
        expect(
            shouldUseFlowWorkspace(
                fixtureFlow({
                    steps: [{ toolId: 'pdf-compress', label: 'Only' }],
                    recommended: [],
                    context: { slots: [] },
                    stepBindings: {},
                }),
            ),
        ).toBe(false);
    });

    test('P3 pilot Vorhaben → true when flag on', () => {
        localStorage.setItem(STORAGE_KEY, '1');
        const pilots = [
            'story-vermieter-nachweis',
            'story-freelancer-zahlung',
            'story-portal-foto',
        ] as const satisfies readonly StoryId[];
        for (const id of pilots) {
            expect(shouldUseFlowWorkspace(stories[id])).toBe(true);
        }
    });
});

describe('flow step helpers', () => {
    const flow = fixtureFlow();

    test('firstRequiredStep skips optional', () => {
        expect(firstRequiredStep(flow).toolId).toBe('pdf-compress');
    });

    test('nextStepAfter returns following step', () => {
        expect(nextStepAfter(flow, 'pdf-compress')?.toolId).toBe('pdf-redact');
        expect(nextStepAfter(flow, 'pdf-redact')).toBeNull();
    });

    test('isSideQuestTool only for recommended', () => {
        expect(isSideQuestTool(flow, 'pdf-merge')).toBe(true);
        expect(isSideQuestTool(flow, 'pdf-compress')).toBe(false);
    });

    test('stepProgress ignores optional and recommended', () => {
        expect(stepProgress(flow, new Set(['pdf-compress', 'pdf-merge']))).toEqual({
            done: 1,
            total: 1,
        });
    });
});

describe('slot helpers', () => {
    const slots: FlowSlotDef[] = [
        { id: 'doc', kind: 'file', label: 'Dokument', required: true },
        { id: 'note', kind: 'text', label: 'Notiz' },
    ];

    test('missingRequiredSlots when empty', () => {
        const missing = missingRequiredSlots(slots, () => null);
        expect(missing.map((s) => s.id)).toEqual(['doc']);
    });

    test('hasAnySlotSet', () => {
        expect(hasAnySlotSet(slots, () => null)).toBe(false);
        expect(isSlotFilled({ kind: 'text', value: 'hi' })).toBe(true);
        expect(isSlotFilled({ kind: 'password', value: '' })).toBe(false);
    });

    test('validateFileForSlot rejects oversized', () => {
        const slot: FlowSlotDef = {
            id: 'f',
            kind: 'file',
            label: 'F',
            accept: { maxBytes: 10, ext: ['.pdf'] },
        };
        const big = new File([new Uint8Array(20)], 'x.pdf', { type: 'application/pdf' });
        expect(validateFileForSlot(slot, big)).toMatch(/groß/i);
    });

    test('validateFileForSlot rejects wrong ext', () => {
        const slot: FlowSlotDef = {
            id: 'f',
            kind: 'file',
            label: 'F',
            accept: { ext: ['.pdf'] },
        };
        const file = new File(['x'], 'x.png', { type: 'image/png' });
        expect(validateFileForSlot(slot, file)).toMatch(/nicht erlaubt/i);
    });
});
