export const EMBEDDING_MODEL_ID = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';

export type EmbeddingsIndex = {
    model: string;
    dimensions: number;
    documents: Record<string, number[]>;
};

let indexCache: EmbeddingsIndex | null | undefined;
let pipelinePromise: Promise<((text: string) => Promise<number[]>) | null> | null = null;

export async function loadEmbeddingsIndex(): Promise<EmbeddingsIndex | null> {
    if (indexCache !== undefined) return indexCache;

    try {
        const response = await fetch('/search/embeddings.json');
        if (!response.ok) {
            indexCache = null;
            return null;
        }
        const data = (await response.json()) as EmbeddingsIndex;
        indexCache = data;
        return data;
    } catch {
        indexCache = null;
        return null;
    }
}

async function getEmbedPipeline(): Promise<((text: string) => Promise<number[]>) | null> {
    if (!pipelinePromise) {
        pipelinePromise = (async () => {
            try {
                const { pipeline } = await import('@xenova/transformers');
                const extractor = await pipeline('feature-extraction', EMBEDDING_MODEL_ID, {
                    quantized: true,
                });

                return async (text: string): Promise<number[]> => {
                    const output = await extractor(text, {
                        pooling: 'mean',
                        normalize: true,
                    });
                    return Array.from(output.data as Float32Array);
                };
            } catch {
                return null;
            }
        })();
    }
    return pipelinePromise;
}

export async function embedText(text: string): Promise<number[] | null> {
    const embed = await getEmbedPipeline();
    if (!embed) return null;
    try {
        return await embed(text.slice(0, 512));
    } catch {
        return null;
    }
}

export function getDocumentEmbedding(
    index: EmbeddingsIndex,
    documentId: string,
): number[] | undefined {
    return index.documents[documentId];
}

/** Test-Hilfe */
export function resetEmbeddingsCache(): void {
    indexCache = undefined;
    pipelinePromise = null;
}
