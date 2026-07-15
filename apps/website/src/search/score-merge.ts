import { tokenize } from './tokenize';
import type { LexicalScore } from './score-lexical';
import type { QuerySlots } from './types';

export type MergeWeights = {
    lexical: number;
    semantic: number;
};

/** Kurze Queries → mehr Lexical; längere → mehr Semantic. */
export function mergeWeightsForQuery(query: string): MergeWeights {
    const tokens = tokenize(query, { dropStopwords: true });
    const len = tokens.length;

    if (len <= 1) return { lexical: 0.85, semantic: 0.15 };
    if (len === 2) return { lexical: 0.7, semantic: 0.3 };
    if (len <= 4) return { lexical: 0.55, semantic: 0.45 };
    return { lexical: 0.4, semantic: 0.6 };
}

export function mergeHybridScores(
    lexical: Map<string, number>,
    semantic: Map<string, number>,
    lexicalMeta: Map<string, LexicalScore>,
    weights: MergeWeights,
): Map<string, { merged: number; lexical: number; semantic: number; slotBoost: number }> {
    const allIds = new Set([...lexical.keys(), ...semantic.keys()]);
    const merged = new Map<
        string,
        { merged: number; lexical: number; semantic: number; slotBoost: number }
    >();

    for (const id of allIds) {
        const lex = lexical.get(id) ?? 0;
        const sem = semantic.get(id) ?? 0;
        const slotBoost = lexicalMeta.get(id)?.slotBoost ?? 0;
        const hasSemantic = semantic.size > 0;

        const base = hasSemantic
            ? lex * weights.lexical + sem * weights.semantic
            : lex;

        merged.set(id, {
            merged: Math.min(1, base + slotBoost * 0.1),
            lexical: lex,
            semantic: sem,
            slotBoost,
        });
    }

    return merged;
}

export function isLowConfidence(topScore: number): boolean {
    return topScore < 0.35;
}

export function isTie(scores: readonly number[]): boolean {
    if (scores.length < 2) return false;
    const [first, second] = scores;
    return Math.abs(first! - second!) < 0.05;
}

export function shouldTriggerChrome(
    querySlots: QuerySlots,
    topScore: number,
    scores: readonly number[],
): boolean {
    if (querySlots.multiStep) return true;
    if (isLowConfidence(topScore)) return true;
    if (isTie(scores)) return true;
    return false;
}
