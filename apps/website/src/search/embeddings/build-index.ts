/**
 * Build-time script: embeds SearchDocuments → public/search/embeddings.json
 * Run: bun run apps/website/src/search/embeddings/build-index.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from '@xenova/transformers';
import {
    buildSearchDocuments,
    embeddingTextForDocument,
    resetSearchDocumentCache,
} from '../documents';
import { EMBEDDING_MODEL_ID } from './model';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../../../public/search');
const OUT_FILE = path.join(OUT_DIR, 'embeddings.json');

async function main() {
    resetSearchDocumentCache();
    const documents = buildSearchDocuments();

    console.info(`[embeddings] Loading model ${EMBEDDING_MODEL_ID}…`);
    const extractor = await pipeline('feature-extraction', EMBEDDING_MODEL_ID, {
        quantized: true,
    });

    const vectors: Record<string, number[]> = {};
    let dimensions = 0;

    for (const doc of documents) {
        const text = embeddingTextForDocument(doc);
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        const vector = Array.from(output.data as Float32Array);
        dimensions = vector.length;
        vectors[doc.id] = vector;
        console.info(`[embeddings] ${doc.id}`);
    }

    const index = {
        model: EMBEDDING_MODEL_ID,
        dimensions,
        documents: vectors,
    };

    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(index));
    console.info(`[embeddings] ${documents.length} documents → ${OUT_FILE}`);
}

main().catch((error) => {
    console.error('[embeddings] build failed:', error);
    process.exit(1);
});
