import { ASSISTANT_STORAGE_KEYS } from '@macheseinfach/assistant-core';

const DB_NAME = ASSISTANT_STORAGE_KEYS.idbBlobs;
const DB_VERSION = 1;
const BLOB_STORE = 'blobs';

let idbSupported = typeof indexedDB !== 'undefined';
let idbPromise: Promise<IDBDatabase | null> | null = null;

const memoryBlobs = new Map<string, Blob>();

function openIdb(): Promise<IDBDatabase | null> {
    if (!idbSupported) return Promise.resolve(null);
    if (!idbPromise) {
        idbPromise = new Promise((resolve) => {
            try {
                const request = indexedDB.open(DB_NAME, DB_VERSION);
                request.onerror = () => resolve(null);
                request.onupgradeneeded = () => {
                    const db = request.result;
                    if (!db.objectStoreNames.contains(BLOB_STORE)) {
                        db.createObjectStore(BLOB_STORE);
                    }
                };
                request.onsuccess = () => resolve(request.result);
            } catch {
                idbSupported = false;
                resolve(null);
            }
        });
    }
    return idbPromise;
}

export async function idbGetBlob(key: string): Promise<Blob | null> {
    const cached = memoryBlobs.get(key);
    if (cached) return cached;

    const db = await openIdb();
    if (!db) return memoryBlobs.get(key) ?? null;

    return new Promise((resolve) => {
        const tx = db.transaction(BLOB_STORE, 'readonly');
        const request = tx.objectStore(BLOB_STORE).get(key);
        request.onsuccess = () => {
            const blob = request.result as Blob | undefined;
            if (blob) memoryBlobs.set(key, blob);
            resolve(blob ?? null);
        };
        request.onerror = () => resolve(memoryBlobs.get(key) ?? null);
    });
}

export async function idbPutBlob(key: string, blob: Blob): Promise<void> {
    memoryBlobs.set(key, blob);
    const db = await openIdb();
    if (!db) return;

    await new Promise<void>((resolve) => {
        const tx = db.transaction(BLOB_STORE, 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
        tx.objectStore(BLOB_STORE).put(blob, key);
    });
}

export async function idbDeleteBlob(key: string): Promise<void> {
    memoryBlobs.delete(key);
    const db = await openIdb();
    if (!db) return;

    await new Promise<void>((resolve) => {
        const tx = db.transaction(BLOB_STORE, 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
        tx.objectStore(BLOB_STORE).delete(key);
    });
}

/** Test helper — clear in-memory cache between tests. */
export function resetAssistantIdbMemory(): void {
    memoryBlobs.clear();
}
