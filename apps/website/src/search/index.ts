import { buildSearchDocuments } from './documents';
import { documentMatchesFilters, parseSearchFilters } from './filters';
import { resolveChromeIntent } from './intents-chrome';
import { scoreLexical, normalizeLexicalScores } from './score-lexical';
import { scoreSemantic, normalizeSemanticScores } from './score-semantic';
import { mergeHybridScores, mergeWeightsForQuery, shouldTriggerChrome } from './score-merge';
import type { ResolveSearchOptions, ScoredResult, SearchDocument } from './types';

const DEFAULT_LIMIT = 12;

function filterDocuments(
    documents: SearchDocument[],
    options: ResolveSearchOptions,
    rawQuery: string,
): { documents: SearchDocument[]; textQuery: string } {
    const filters = options.filters ?? parseSearchFilters(rawQuery);
    const filtered = documents.filter((doc) => documentMatchesFilters(doc, filters));
    return { documents: filtered, textQuery: filters.textQuery };
}

/**
 * Hybride 3-Stufen-Suche:
 * 1. Lexical (BM25-lite + Slots + Bigrams)
 * 2. Semantic (Transformers.js Cosine)
 * 3. Chrome Prompt API (bei niedrigem Score / Gleichstand / Multi-Step)
 */
export async function resolveSearch(
    query: string,
    options: ResolveSearchOptions = {},
): Promise<ScoredResult[]> {
    const trimmed = query.trim();
    const limit = options.limit ?? DEFAULT_LIMIT;
    const showBreakdown = options.showBreakdown ?? false;
    const allDocuments = buildSearchDocuments();
    const { documents, textQuery } = filterDocuments(allDocuments, options, trimmed);

    if (!textQuery) {
        return documents.slice(0, limit).map((doc) => ({
            document: doc,
            score: 0,
            source: 'lexical' as const,
        }));
    }

    const lexicalRaw = scoreLexical(textQuery, documents);
    const lexical = normalizeLexicalScores(lexicalRaw);

    const semanticRaw = await scoreSemantic(textQuery, documents);
    const semantic = normalizeSemanticScores(semanticRaw);
    const weights = mergeWeightsForQuery(textQuery);

    const merged = mergeHybridScores(lexical, semantic, lexicalRaw, weights);

    let results: ScoredResult[] = [];

    for (const [id, scores] of merged) {
        const doc = documents.find((d) => d.id === id);
        if (!doc) continue;
        results.push({
            document: doc,
            score: scores.merged,
            breakdown: showBreakdown
                ? {
                      lexical: scores.lexical,
                      semantic: scores.semantic,
                      slotBoost: scores.slotBoost,
                      merged: scores.merged,
                  }
                : undefined,
            source: semantic.size > 0 ? 'hybrid' : 'lexical',
        });
    }

    results.sort((a, b) => b.score - a.score);

    const topScore = results[0]?.score ?? 0;
    const topScores = results.slice(0, 3).map((r) => r.score);
    const querySlots = lexicalRaw.values().next().value?.querySlots ?? {
        formats: [],
        actions: [],
        context: [],
        multiStep: false,
    };

    const chromeEnabled = options.chromeAi !== false;
    if (chromeEnabled && shouldTriggerChrome(querySlots, topScore, topScores)) {
        const chromeIntent = await resolveChromeIntent(textQuery);
        if (chromeIntent && chromeIntent.documentIds.length > 0) {
            const chromeResults: ScoredResult[] = [];
            const seen = new Set<string>();

            for (const docId of chromeIntent.documentIds) {
                const doc = documents.find((d) => d.id === docId);
                if (!doc || seen.has(docId)) continue;
                seen.add(docId);

                const existing = results.find((r) => r.document.id === docId);
                const baseScore = existing?.score ?? 0.5;
                chromeResults.push({
                    document: doc,
                    score: Math.max(baseScore, 0.75),
                    breakdown: showBreakdown
                        ? {
                              ...existing?.breakdown,
                              lexical: existing?.breakdown?.lexical ?? 0,
                              semantic: existing?.breakdown?.semantic ?? 0,
                              slotBoost: existing?.breakdown?.slotBoost ?? 0,
                              chrome: 0.75,
                              merged: Math.max(baseScore, 0.75),
                          }
                        : undefined,
                    source: 'chrome',
                });
            }

            const rest = results.filter((r) => !seen.has(r.document.id));
            results = [...chromeResults, ...rest];
        }
    }

    return results.slice(0, limit);
}

export { buildSearchDocuments } from './documents';
export { chromeAiSearchAvailable } from './intents-chrome';
export { documentMatchesFilters, filterHint, parseSearchFilters } from './filters';
export { getSemanticScoreState } from './score-semantic';
export type { ParsedSearchFilters } from './filters';
export type { ScoredResult, SearchDocument, ResolveSearchOptions } from './types';
