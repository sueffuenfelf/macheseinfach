import {
    ASSISTANT_STORAGE_KEYS,
    createDefaultSettings,
    type AssistantLayoutMode,
    type AssistantSettings,
} from '@macheseinfach/assistant-core';

export const CURATED_MODELS = [
    { id: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4' },
    { id: 'anthropic/claude-3.5-haiku', label: 'Claude 3.5 Haiku (günstiger)' },
    { id: 'google/gemini-2.5-flash-preview', label: 'Gemini 2.5 Flash' },
    { id: 'openai/gpt-4o-mini', label: 'GPT-4o mini' },
] as const;

function readApiKey(): string {
    try {
        return localStorage.getItem(ASSISTANT_STORAGE_KEYS.openRouterApiKey) ?? '';
    } catch {
        return '';
    }
}

function writeApiKey(value: string): void {
    try {
        if (value) {
            localStorage.setItem(ASSISTANT_STORAGE_KEYS.openRouterApiKey, value);
        } else {
            localStorage.removeItem(ASSISTANT_STORAGE_KEYS.openRouterApiKey);
        }
    } catch {
        /* quota / private mode */
    }
}

export function readAssistantSettings(): AssistantSettings {
    const defaults = createDefaultSettings();
    try {
        const raw = localStorage.getItem(ASSISTANT_STORAGE_KEYS.settings);
        const parsed = raw ? (JSON.parse(raw) as Partial<AssistantSettings>) : {};
        return {
            layoutMode: parsed.layoutMode === 'sidebar' ? 'sidebar' : 'floating',
            model:
                typeof parsed.model === 'string' && parsed.model.trim()
                    ? parsed.model.trim()
                    : defaults.model,
            enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : defaults.enabled,
            openRouterApiKey: readApiKey(),
        };
    } catch {
        return { ...defaults, openRouterApiKey: readApiKey() };
    }
}

export function writeAssistantSettings(patch: Partial<AssistantSettings>): AssistantSettings {
    const current = readAssistantSettings();
    const next: AssistantSettings = {
        ...current,
        ...patch,
    };

    if ('openRouterApiKey' in patch) {
        writeApiKey(next.openRouterApiKey);
    }

    try {
        const { layoutMode, model, enabled } = next;
        localStorage.setItem(
            ASSISTANT_STORAGE_KEYS.settings,
            JSON.stringify({ layoutMode, model, enabled }),
        );
    } catch {
        /* quota / private mode */
    }

    return next;
}

export function setAssistantLayoutMode(mode: AssistantLayoutMode): AssistantSettings {
    return writeAssistantSettings({ layoutMode: mode });
}
