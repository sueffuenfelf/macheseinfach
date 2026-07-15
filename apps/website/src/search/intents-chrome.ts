import type { ChromeIntentResult } from './types';
import { buildSearchDocuments, getSearchDocumentById } from './documents';

type ChromeLanguageModel = {
    create: (options?: { systemPrompt?: string }) => Promise<ChromeLanguageModelSession>;
};

type ChromeLanguageModelSession = {
    prompt: (input: string) => Promise<string>;
    destroy?: () => void;
};

type ChromeAiWindow = Window & {
    ai?: {
        languageModel?: ChromeLanguageModel;
    };
};

function isChromeAiAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    const w = window as ChromeAiWindow;
    return Boolean(w.ai?.languageModel?.create);
}

function buildCatalogPrompt(query: string): string {
    const docs = buildSearchDocuments();
    const catalogLines = docs
        .slice(0, 80)
        .map((doc) => `- id: "${doc.id}" | ${doc.kind} | ${doc.title} | ${doc.subtitle}`)
        .join('\n');

    return `Du bist ein Routing-Assistent für macheseinfach.de — lokale Browser-Tools auf Deutsch.

Der Nutzer sucht: "${query}"

Wähle bis zu 5 passende Einträge aus diesem Katalog. Antworte NUR mit gültigem JSON:
{"documentIds": ["id1", "id2"], "reasoning": "kurze Begründung auf Deutsch"}

Katalog:
${catalogLines}`;
}

function parseIntentJson(raw: string): ChromeIntentResult | null {
    const trimmed = raw.trim();
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    try {
        const parsed = JSON.parse(jsonMatch[0]) as {
            documentIds?: unknown;
            reasoning?: unknown;
        };
        if (!Array.isArray(parsed.documentIds)) return null;

        const documentIds = parsed.documentIds
            .filter((id): id is string => typeof id === 'string')
            .filter((id) => Boolean(getSearchDocumentById(id)));

        return {
            documentIds,
            reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : undefined,
        };
    } catch {
        return null;
    }
}

export function chromeAiSearchAvailable(): boolean {
    return isChromeAiAvailable();
}

/** Stage 3: Chrome Prompt API — nur bei niedrigem Score, Gleichstand oder Multi-Step. */
export async function resolveChromeIntent(query: string): Promise<ChromeIntentResult | null> {
    if (!isChromeAiAvailable()) return null;

    const w = window as ChromeAiWindow;
    let session: ChromeLanguageModelSession | null = null;

    try {
        session = await w.ai!.languageModel!.create({
            systemPrompt:
                'Du hilfst Nutzer:innen, das richtige lokale Tool auf macheseinfach.de zu finden. Antworte nur mit JSON.',
        });
        const response = await session.prompt(buildCatalogPrompt(query));
        return parseIntentJson(response);
    } catch {
        return null;
    } finally {
        session?.destroy?.();
    }
}
