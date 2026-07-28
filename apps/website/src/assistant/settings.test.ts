import { afterEach, describe, expect, test } from 'bun:test';
import { createDefaultSettings } from '@macheseinfach/assistant-core';
import {
    ASSISTANT_SETTINGS_CHANGED_EVENT,
    CURATED_MODELS,
    isCuratedModel,
    readAssistantSettings,
    writeAssistantSettings,
} from './settings';

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
