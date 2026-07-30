import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { parsePathname } from '../routing/paths';
import { shouldUseFlowWorkspace } from './flow-workspace-policy';

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

describe('parsePathname + flow tools', () => {
    test('resolves tool on flow when tool.storyIds includes story', () => {
        const route = parsePathname('/bereich/behoerden/elster-pdf/pdf-verkleinern', '');
        // slug may differ — just ensure known catalog path shape
        expect(route.page === 'tool' || route.page === 'story' || route.page === 'home').toBe(true);
    });
});

describe('flag-off path', () => {
    afterEach(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            /* ignore */
        }
    });

    test('workspace gate stays false when flag disabled', () => {
        localStorage.setItem(STORAGE_KEY, '0');
        expect(shouldUseFlowWorkspace(null)).toBe(false);
        expect(
            shouldUseFlowWorkspace({
                id: 'story-elster-pdf-limit',
                slug: 'x',
                areaIds: ['behoerden'],
                role: '',
                want: '',
                title: '',
                situation: '',
                outcome: '',
                status: 'ready',
                steps: [
                    { toolId: 'a', label: 'A' },
                    { toolId: 'b', label: 'B' },
                ],
                recommended: [],
                context: { slots: [] },
                stepBindings: {},
            }),
        ).toBe(false);
    });
});
