import { yieldToMain } from './yield';
import type { BatchItemInput, BatchProcessor, JobContext, JobRecord } from './types';

export function createBatchJobRecord<T>(
    context: JobContext,
    items: BatchItemInput[],
): JobRecord {
    const now = new Date().toISOString();
    return {
        id: crypto.randomUUID(),
        context,
        status: 'queued',
        items: items.map((item) => ({
            id: item.id,
            label: item.label,
            status: 'pending',
        })),
        currentIndex: 0,
        resumeIndex: 0,
        progress: 0,
        createdAt: now,
        updatedAt: now,
    };
}

export type RunBatchOptions<T> = {
    job: JobRecord;
    payloads: T[];
    processor: BatchProcessor<T>;
    signal: AbortSignal;
    startIndex?: number;
    onJobUpdate: (job: JobRecord) => void;
};

export async function runBatchItems<T>({
    job,
    payloads,
    processor,
    signal,
    startIndex = 0,
    onJobUpdate,
}: RunBatchOptions<T>): Promise<JobRecord> {
    const total = job.items.length;
    let current = { ...job, status: 'running' as const, updatedAt: new Date().toISOString() };
    onJobUpdate(current);

    for (let index = startIndex; index < total; index += 1) {
        if (signal.aborted) {
            current = {
                ...current,
                status: 'paused',
                resumeIndex: index,
                currentIndex: index,
                updatedAt: new Date().toISOString(),
            };
            onJobUpdate(current);
            return current;
        }

        const item = current.items[index];
        if (!item || item.status === 'done' || item.status === 'skipped') continue;

        const items = current.items.map((entry, i) =>
            i === index ? { ...entry, status: 'running' as const } : entry,
        );
        current = {
            ...current,
            items,
            currentIndex: index,
            progress: index / total,
            updatedAt: new Date().toISOString(),
        };
        onJobUpdate(current);

        try {
            await processor(payloads[index] as T, {
                jobId: current.id,
                itemId: item.id,
                index,
                total,
                signal,
            });

            const doneItems = current.items.map((entry, i) =>
                i === index ? { ...entry, status: 'done' as const } : entry,
            );
            current = {
                ...current,
                items: doneItems,
                progress: (index + 1) / total,
                resumeIndex: index + 1,
                updatedAt: new Date().toISOString(),
            };
            onJobUpdate(current);
        } catch (error) {
            if (signal.aborted) {
                current = {
                    ...current,
                    status: 'paused',
                    resumeIndex: index,
                    currentIndex: index,
                    updatedAt: new Date().toISOString(),
                };
                onJobUpdate(current);
                return current;
            }

            const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
            const failedItems = current.items.map((entry, i) =>
                i === index ? { ...entry, status: 'failed' as const, error: message } : entry,
            );
            current = {
                ...current,
                status: 'failed',
                items: failedItems,
                error: message,
                updatedAt: new Date().toISOString(),
            };
            onJobUpdate(current);
            return current;
        }

        await yieldToMain();
    }

    current = {
        ...current,
        status: 'completed',
        progress: 1,
        currentIndex: total,
        resumeIndex: total,
        updatedAt: new Date().toISOString(),
    };
    onJobUpdate(current);
    return current;
}
