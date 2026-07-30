import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { createDefaultSettings } from '@macheseinfach/assistant-core';
import {
    ASSISTANT_SETTINGS_CHANGED_EVENT,
    CURATED_MODELS,
    isCuratedModel,
    readAssistantSettings,
    writeAssistantSettings,
} from './settings';

beforeAll(() => {
    if (typeof globalThis.localStorage === 'undefined') {
        const store = new Map<string, string>();
        globalThis.localStorage = {
            getItem: (key: string) => store.get(key) ?? null,
            setItem: (key: string, value: string) => {
                store.set(key, String(value));
            },
            removeItem: (key: string) => {
                store.delete(key);
            },
            clear: () => {
                store.clear();
            },
            key: (index: number) => [...store.keys()][index] ?? null,
            get length() {
                return store.size;
            },
        } as Storage;
    }

    if (typeof globalThis.window === 'undefined') {
        const listeners = new Map<string, Set<EventListener>>();
        globalThis.window = {
            addEventListener: (type: string, listener: EventListener) => {
                const set = listeners.get(type) ?? new Set();
                set.add(listener);
                listeners.set(type, set);
            },
            removeEventListener: (type: string, listener: EventListener) => {
                listeners.get(type)?.delete(listener);
            },
            dispatchEvent: (event: Event) => {
                for (const listener of listeners.get(event.type) ?? []) {
                    listener(event);
                }
                return true;
            },
        } as unknown as Window & typeof globalThis;
    }

    if (typeof globalThis.CustomEvent === 'undefined') {
        globalThis.CustomEvent = class CustomEvent<T = unknown> extends Event {
            detail: T;
            constructor(type: string, init?: CustomEventInit<T>) {
                super(type, init);
                this.detail = (init?.detail ?? undefined) as T;
            }
        } as typeof CustomEvent;
    }
});

afterEach(() => {
    localStorage.clear();
});

describe('assistant settings models', () => {
    test('default model is Openrouter Free Rotation', () => {
        const defaults = createDefaultSettings();
        expect(defaults.model).toBe('openrouter/free');
        expect(CURATED_MODELS[0]).toEqual({
            id: 'openrouter/free',
            label: 'Openrouter Free Rotation',
        });
        expect(isCuratedModel('openrouter/free')).toBe(true);
        expect(isCuratedModel('vendor/custom-model')).toBe(false);
    });

    test('readAssistantSettings falls back to openrouter/free', () => {
        expect(readAssistantSettings().model).toBe('openrouter/free');
    });

    test('writeAssistantSettings persists custom model ids', () => {
        const next = writeAssistantSettings({ model: 'my-org/special-model' });
        expect(next.model).toBe('my-org/special-model');
        expect(readAssistantSettings().model).toBe('my-org/special-model');
        expect(isCuratedModel(next.model)).toBe(false);
    });

    test('writeAssistantSettings dispatches same-tab change event', () => {
        let fired = 0;
        const onChange = () => {
            fired += 1;
        };
        window.addEventListener(ASSISTANT_SETTINGS_CHANGED_EVENT, onChange);
        writeAssistantSettings({ model: 'openrouter/free' });
        window.removeEventListener(ASSISTANT_SETTINGS_CHANGED_EVENT, onChange);
        expect(fired).toBe(1);
    });
});
