export type JobStatus = 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export type JobItemStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped';

/** Where to return when the user clicks a toast, notification, or job card. */
export type JobContext = {
    label: string;
    toolId?: string;
    toolSlug?: string;
    /** App pathname, e.g. `/tool/heic-convert` */
    route: string;
    workspaceId?: string;
};

export type JobItemRecord = {
    id: string;
    label: string;
    status: JobItemStatus;
    error?: string;
};

export type JobRecord = {
    id: string;
    context: JobContext;
    status: JobStatus;
    items: JobItemRecord[];
    currentIndex: number;
    progress: number;
    createdAt: string;
    updatedAt: string;
    error?: string;
    /** Resume cursor — index of next pending item */
    resumeIndex: number;
};

export type BatchItemInput = {
    id: string;
    label: string;
};

export type BatchProcessor<T> = (
    payload: T,
    meta: {
        jobId: string;
        itemId: string;
        index: number;
        total: number;
        signal: AbortSignal;
    },
) => Promise<void>;
