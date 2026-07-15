import { embedText, getDocumentEmbedding, loadEmbeddingsIndex } from './embeddings/model';
import type { SearchDocument } from './types';

function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i += 1) {
        dot += a[i]! * b[i]!;
        normA += a[i]! * a[i]!;
        normB += b[i]! * b[i]!;
    }

    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom > 0 ? dot / denom : 0;
}

export type SemanticScoreState = 'idle' | 'loading' | 'ready' | 'unavailable';

let semanticState: SemanticScoreState = 'idle';

export function getSemanticScoreState(): SemanticScoreState {
    return semanticState;
}

/** Cosine-Ähnlichkeit zwischen Query-Embedding und Dokument-Vektoren. */
export async function scoreSemantic(
    query: string,
    documents: readonly SearchDocument[],
): Promise<Map<string, number>> {
    const results = new Map<string, number>();

    if (!query.trim()) return results;

    semanticState = 'loading';
    try {
        const index = await loadEmbeddingsIndex();
        if (!index) {
            semanticState = 'unavailable';
            return results;
        }

        const queryVector = await embedText(query);
        if (!queryVector) {
            semanticState = 'unavailable';
            return results;
        }

        for (const doc of documents) {
            const docVector = getDocumentEmbedding(index, doc.id);
            if (!docVector) continue;
            const sim = cosineSimilarity(queryVector, docVector);
            // Cosine für normalisierte Embeddings liegt typisch bei 0..1
            results.set(doc.id, Math.max(0, sim));
        }

        semanticState = 'ready';
    } catch {
        semanticState = 'unavailable';
    }

    return results;
}

export function normalizeSemanticScores(scores: Map<string, number>): Map<string, number> {
    const values = [...scores.values()];
    if (values.length === 0) return scores;

    const max = Math.max(...values, 0.001);
    const min = Math.min(...values);
    const range = max - min || 1;

    const normalized = new Map<string, number>();
    for (const [id, score] of scores) {
        normalized.set(id, (score - min) / range);
    }
    return normalized;
}
