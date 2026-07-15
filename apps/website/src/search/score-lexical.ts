import { normalizeQuery, normalizeToken } from './normalize';
import { contentTokens, queryBigrams, tokenize } from './tokenize';
import { extractQuerySlots, slotBoostForDocument } from './slots';
import type { QuerySlots, SearchDocument } from './types';

const K1 = 1.2;
const B = 0.75;

type CorpusStats = {
    avgDocLen: number;
    docFreq: Map<string, number>;
    totalDocs: number;
};

function buildCorpusStats(documents: readonly SearchDocument[]): CorpusStats {
    const docFreq = new Map<string, number>();
    let totalLen = 0;

    for (const doc of documents) {
        const tokens = new Set(contentTokens(doc.body));
        totalLen += tokens.size;
        for (const token of tokens) {
            docFreq.set(token, (docFreq.get(token) ?? 0) + 1);
        }
    }

    return {
        avgDocLen: documents.length > 0 ? totalLen / documents.length : 1,
        docFreq,
        totalDocs: documents.length,
    };
}

function idf(term: string, stats: CorpusStats): number {
    const df = stats.docFreq.get(term) ?? 0;
    return Math.log(1 + (stats.totalDocs - df + 0.5) / (df + 0.5));
}

function termFreq(docTokens: readonly string[], term: string): number {
    return docTokens.filter((t) => t === term).length;
}

function bm25Score(
    queryTerms: readonly string[],
    docTokens: readonly string[],
    stats: CorpusStats,
): number {
    const docLen = docTokens.length || 1;
    let score = 0;

    for (const term of queryTerms) {
        const tf = termFreq(docTokens, term);
        if (tf === 0) continue;
        const idfVal = idf(term, stats);
        const numerator = tf * (K1 + 1);
        const denominator = tf + K1 * (1 - B + (B * docLen) / stats.avgDocLen);
        score += idfVal * (numerator / denominator);
    }

    return score;
}

function partialMatchScore(query: string, doc: SearchDocument): number {
    const q = normalizeQuery(query);
    if (!q) return 0;

    const haystack = normalizeQuery(
        [doc.title, doc.subtitle, doc.body, ...doc.keywords].join(' '),
    );
    if (haystack.includes(q)) return 1;

    const qTokens = tokenize(q, { dropStopwords: false });
    let matched = 0;
    for (const token of qTokens) {
        const norm = normalizeToken(token);
        if (haystack.includes(norm) || haystack.includes(token)) matched += 1;
    }

    return qTokens.length > 0 ? matched / qTokens.length : 0;
}

function fuzzyTokenScore(queryTerms: readonly string[], docText: string): number {
    const docTokens = new Set(contentTokens(docText));
    let score = 0;

    for (const term of queryTerms) {
        if (docTokens.has(term)) {
            score += 0.3;
            continue;
        }
        const prefix = term.slice(0, Math.max(3, Math.floor(term.length * 0.7)));
        for (const docToken of docTokens) {
            if (docToken.startsWith(prefix) || prefix.startsWith(docToken.slice(0, 3))) {
                score += 0.15;
                break;
            }
        }
    }

    return score;
}

function bigramBoost(query: string, doc: SearchDocument): number {
    const tokens = tokenize(query, { dropStopwords: true });
    const bigrams = queryBigrams(tokens);
    if (bigrams.length === 0) return 0;

    const haystack = normalizeQuery(
        [doc.title, doc.subtitle, doc.body].join(' '),
    );
    let hits = 0;
    for (const bigram of bigrams) {
        if (haystack.includes(bigram)) hits += 1;
    }

    return hits / bigrams.length;
}

function titleBoost(queryTerms: readonly string[], doc: SearchDocument): number {
    const titleTokens = new Set(contentTokens(doc.title));
    let hits = 0;
    for (const term of queryTerms) {
        if (titleTokens.has(term)) hits += 1;
    }
    return queryTerms.length > 0 ? (hits / queryTerms.length) * 0.5 : 0;
}

export type LexicalScore = {
    score: number;
    slotBoost: number;
    querySlots: QuerySlots;
};

export function scoreLexical(
    query: string,
    documents: readonly SearchDocument[],
): Map<string, LexicalScore> {
    const normalized = normalizeQuery(query);
    if (!normalized) return new Map();

    const queryTerms = tokenize(normalized, { dropStopwords: true });
    const allTerms = tokenize(normalized, { dropStopwords: false });
    const querySlots = extractQuerySlots(query);
    const stats = buildCorpusStats(documents);
    const results = new Map<string, LexicalScore>();

    for (const doc of documents) {
        const docTokens = contentTokens(doc.body);
        const bm25 = bm25Score(queryTerms.length > 0 ? queryTerms : allTerms, docTokens, stats);
        const partial = partialMatchScore(query, doc);
        const fuzzy = fuzzyTokenScore(queryTerms, doc.body);
        const bigram = bigramBoost(query, doc);
        const title = titleBoost(queryTerms.length > 0 ? queryTerms : allTerms, doc);
        const slotBoost = slotBoostForDocument(querySlots, doc.slots);

        const raw =
            bm25 * 0.45 +
            partial * 0.25 +
            fuzzy * 0.1 +
            bigram * 0.1 +
            title * 0.1 +
            slotBoost;

        results.set(doc.id, { score: raw, slotBoost, querySlots });
    }

    return results;
}

export function normalizeLexicalScores(scores: Map<string, LexicalScore>): Map<string, number> {
    const values = [...scores.values()].map((s) => s.score);
    const max = Math.max(...values, 0.001);
    const normalized = new Map<string, number>();
    for (const [id, entry] of scores) {
        normalized.set(id, entry.score / max);
    }
    return normalized;
}
