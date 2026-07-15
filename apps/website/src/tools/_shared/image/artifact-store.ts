import type { ImageArtifact } from './types';

const sessionStore = new Map<string, ImageArtifact>();

const DB_NAME = 'msf-image-artifacts';
const DB_VERSION = 1;
const IDB_STORE = 'artifacts';

let idbSupported = typeof indexedDB !== 'undefined';
let idbPromise: Promise<IDBDatabase | null> | null = null;

function createArtifactId(): string {
    try {
        return crypto.randomUUID();
    } catch {
        return `img-${Math.random().toString(36).slice(2, 11)}`;
    }
}

function openIdb(): Promise<IDBDatabase | null> {
    if (!idbSupported) return Promise.resolve(null);
    if (!idbPromise) {
        idbPromise = new Promise((resolve) => {
            try {
                const request = indexedDB.open(DB_NAME, DB_VERSION);
                request.onerror = () => resolve(null);
                request.onupgradeneeded = () => {
                    const db = request.result;
                    if (!db.objectStoreNames.contains(IDB_STORE)) {
                        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
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

type StoredArtifactRecord = {
    id: string;
    filename: string;
    mime: string;
    width: number;
    height: number;
    byteSize: number;
    blob: Blob;
};

async function persistToIdb(artifact: ImageArtifact): Promise<void> {
    const db = await openIdb();
    if (!db) return;
    await new Promise<void>((resolve) => {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
        tx.objectStore(IDB_STORE).put({
            id: artifact.id,
            filename: artifact.filename,
            mime: artifact.mime,
            width: artifact.width,
            height: artifact.height,
            byteSize: artifact.byteSize,
            blob: artifact.blob,
        } satisfies StoredArtifactRecord);
    });
}

async function removeFromIdb(id: string): Promise<void> {
    const db = await openIdb();
    if (!db) return;
    await new Promise<void>((resolve) => {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
        tx.objectStore(IDB_STORE).delete(id);
    });
}

async function clearIdb(): Promise<void> {
    const db = await openIdb();
    if (!db) return;
    await new Promise<void>((resolve) => {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
        tx.objectStore(IDB_STORE).clear();
    });
}

async function readFromIdb(id: string): Promise<ImageArtifact | undefined> {
    const db = await openIdb();
    if (!db) return undefined;
    return new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const request = tx.objectStore(IDB_STORE).get(id);
        request.onsuccess = () => {
            const record = request.result as StoredArtifactRecord | undefined;
            if (!record?.blob) {
                resolve(undefined);
                return;
            }
            resolve({
                id: record.id,
                blob: record.blob,
                filename: record.filename,
                mime: record.mime,
                width: record.width,
                height: record.height,
                byteSize: record.byteSize,
            });
        };
        request.onerror = () => resolve(undefined);
    });
}

export async function readImageDimensions(
    blob: Blob,
): Promise<{ width: number; height: number }> {
    const bitmap = await createImageBitmap(blob);
    const dims = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dims;
}

export async function createImageArtifactFromBlob(
    blob: Blob,
    filename: string,
    id = createArtifactId(),
): Promise<ImageArtifact> {
    const { width, height } = await readImageDimensions(blob);
    const artifact: ImageArtifact = {
        id,
        blob,
        filename,
        mime: blob.type || 'application/octet-stream',
        width,
        height,
        byteSize: blob.size,
    };
    putImageArtifact(artifact);
    return artifact;
}

export async function createImageArtifactFromFile(file: File): Promise<ImageArtifact> {
    return createImageArtifactFromBlob(file, file.name);
}

export function putImageArtifact(artifact: ImageArtifact): void {
    sessionStore.set(artifact.id, artifact);
    void persistToIdb(artifact);
}

export function getImageArtifact(id: string): ImageArtifact | undefined {
    return sessionStore.get(id);
}

export async function getImageArtifactAsync(id: string): Promise<ImageArtifact | undefined> {
    const cached = sessionStore.get(id);
    if (cached) return cached;
    const fromIdb = await readFromIdb(id);
    if (fromIdb) sessionStore.set(fromIdb.id, fromIdb);
    return fromIdb;
}

export function deleteImageArtifact(id: string): void {
    sessionStore.delete(id);
    void removeFromIdb(id);
}

export function clearImageArtifacts(): void {
    sessionStore.clear();
    void clearIdb();
}

export function listImageArtifactIds(): string[] {
    return [...sessionStore.keys()];
}

export async function hydrateImageArtifactsFromIdb(): Promise<number> {
    const db = await openIdb();
    if (!db) return 0;
    return new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const request = tx.objectStore(IDB_STORE).getAll();
        request.onsuccess = () => {
            const records = (request.result ?? []) as StoredArtifactRecord[];
            for (const record of records) {
                if (!record?.blob) continue;
                sessionStore.set(record.id, {
                    id: record.id,
                    blob: record.blob,
                    filename: record.filename,
                    mime: record.mime,
                    width: record.width,
                    height: record.height,
                    byteSize: record.byteSize,
                });
            }
            resolve(records.length);
        };
        request.onerror = () => resolve(0);
    });
}

export function artifactToFile(artifact: ImageArtifact): File {
    return new File([artifact.blob], artifact.filename, {
        type: artifact.mime || 'application/octet-stream',
    });
}
