import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { runBatchItems, createBatchJobRecord } from './batch';
import { loadPersistedJobs, savePersistedJobs } from './persistence';
import type { BatchItemInput, BatchProcessor, JobContext, JobRecord } from './types';

type ActiveRunner<T = unknown> = {
    payloads: T[];
    processor: BatchProcessor<T>;
    abort: AbortController;
};

type EnqueueBatchOptions<T> = {
    context: JobContext;
    items: BatchItemInput[];
    payloads: T[];
    processor: BatchProcessor<T>;
    /** Called when job completes, fails, or is paused — for tool-local UI sync */
    onStatusChange?: (job: JobRecord) => void;
};

type ReattachBatchOptions<T> = {
    jobId: string;
    payloads: T[];
    processor: BatchProcessor<T>;
    onStatusChange?: (job: JobRecord) => void;
};

type JobQueueContextValue = {
    jobs: JobRecord[];
    activeJobs: JobRecord[];
    enqueueBatch: <T>(options: EnqueueBatchOptions<T>) => string;
    reattachBatch: <T>(options: ReattachBatchOptions<T>) => boolean;
    pauseJob: (jobId: string) => void;
    resumeJob: (jobId: string) => void;
    cancelJob: (jobId: string) => void;
    dismissJob: (jobId: string) => void;
    getResumableJobForRoute: (route: string) => JobRecord | undefined;
    canResumeJob: (jobId: string) => boolean;
};

const JobQueueContext = createContext<JobQueueContextValue | null>(null);

export type JobQueueNotifier = {
    onJobQueued: (job: JobRecord) => void;
    onJobProgress: (job: JobRecord) => void;
    onJobPaused: (job: JobRecord) => void;
    onJobCompleted: (job: JobRecord) => void;
    onJobFailed: (job: JobRecord) => void;
    onJobCancelled: (job: JobRecord) => void;
};

export function JobQueueProvider({
    children,
    notifier,
}: {
    children: ReactNode;
    notifier: JobQueueNotifier;
}) {
    const [jobs, setJobs] = useState<JobRecord[]>(() => loadPersistedJobs());
    const jobsRef = useRef(jobs);
    jobsRef.current = jobs;
    const runnersRef = useRef<Map<string, ActiveRunner>>(new Map());
    const statusCallbacksRef = useRef<Map<string, (job: JobRecord) => void>>(new Map());
    const cancelledRef = useRef<Set<string>>(new Set());

    const updateJob = useCallback((next: JobRecord) => {
        setJobs((prev) => {
            const exists = prev.some((j) => j.id === next.id);
            const merged = exists ? prev.map((j) => (j.id === next.id ? next : j)) : [...prev, next];
            savePersistedJobs(merged);
            return merged;
        });
    }, []);

    const runJob = useCallback(
        async <T,>(jobId: string, startIndex: number) => {
            const runner = runnersRef.current.get(jobId) as ActiveRunner<T> | undefined;
            if (!runner) return;

            const job = jobsRef.current.find((j) => j.id === jobId);
            if (!job) return;

            runner.abort = new AbortController();

            const result = await runBatchItems<T>({
                job,
                payloads: runner.payloads,
                processor: runner.processor,
                signal: runner.abort.signal,
                startIndex,
                onJobUpdate: (updated) => {
                    updateJob(updated);
                    if (updated.status === 'running') {
                        notifier.onJobProgress(updated);
                    }
                    statusCallbacksRef.current.get(jobId)?.(updated);
                },
            });

            if (cancelledRef.current.has(jobId)) {
                cancelledRef.current.delete(jobId);
                return;
            }

            if (!runnersRef.current.has(jobId)) return;

            if (result.status === 'completed') {
                notifier.onJobCompleted(result);
                runnersRef.current.delete(jobId);
                statusCallbacksRef.current.delete(jobId);
            } else if (result.status === 'failed') {
                notifier.onJobFailed(result);
                runnersRef.current.delete(jobId);
                statusCallbacksRef.current.delete(jobId);
            } else if (result.status === 'paused') {
                notifier.onJobPaused(result);
            }
        },
        [notifier, updateJob],
    );

    const enqueueBatch = useCallback(
        <T,>(options: EnqueueBatchOptions<T>) => {
            const job = createBatchJobRecord(options.context, options.items);
            runnersRef.current.set(job.id, {
                payloads: options.payloads,
                processor: options.processor,
                abort: new AbortController(),
            });
            if (options.onStatusChange) {
                statusCallbacksRef.current.set(job.id, options.onStatusChange);
            }

            setJobs((prev) => {
                const next = [...prev, job];
                savePersistedJobs(next);
                return next;
            });
            notifier.onJobQueued(job);

            void runJob(job.id, 0);
            return job.id;
        },
        [notifier, runJob],
    );

    const reattachBatch = useCallback(
        <T,>(options: ReattachBatchOptions<T>) => {
            const job = jobs.find((j) => j.id === options.jobId);
            if (!job || !['paused', 'queued'].includes(job.status)) return false;

            runnersRef.current.set(job.id, {
                payloads: options.payloads,
                processor: options.processor,
                abort: new AbortController(),
            });
            if (options.onStatusChange) {
                statusCallbacksRef.current.set(job.id, options.onStatusChange);
            }
            void runJob(job.id, job.resumeIndex);
            return true;
        },
        [jobs, runJob],
    );

    const pauseJob = useCallback(
        (jobId: string) => {
            const runner = runnersRef.current.get(jobId);
            runner?.abort.abort();
        },
        [],
    );

    const resumeJob = useCallback(
        (jobId: string) => {
            const job = jobs.find((j) => j.id === jobId);
            if (!job || !runnersRef.current.has(jobId)) return;
            const startIndex = job.resumeIndex;
            void runJob(jobId, startIndex);
        },
        [jobs, runJob],
    );

    const cancelJob = useCallback(
        (jobId: string) => {
            cancelledRef.current.add(jobId);
            const runner = runnersRef.current.get(jobId);
            runner?.abort.abort();
            runnersRef.current.delete(jobId);
            statusCallbacksRef.current.delete(jobId);

            setJobs((prev) => {
                const next = prev.map((j) =>
                    j.id === jobId
                        ? {
                              ...j,
                              status: 'cancelled' as const,
                              updatedAt: new Date().toISOString(),
                          }
                        : j,
                );
                savePersistedJobs(next);
                return next;
            });
            const cancelled = jobsRef.current.find((j) => j.id === jobId);
            if (cancelled) notifier.onJobCancelled({ ...cancelled, status: 'cancelled' });
        },
        [notifier],
    );

    const dismissJob = useCallback((jobId: string) => {
        setJobs((prev) => {
            const next = prev.filter((j) => j.id !== jobId);
            savePersistedJobs(next);
            return next;
        });
        runnersRef.current.delete(jobId);
        statusCallbacksRef.current.delete(jobId);
    }, []);

    const getResumableJobForRoute = useCallback(
        (route: string) =>
            jobs.find(
                (j) =>
                    j.context.route === route &&
                    (j.status === 'paused' || j.status === 'queued' || j.status === 'running'),
            ),
        [jobs],
    );

    const canResumeJob = useCallback((jobId: string) => runnersRef.current.has(jobId), []);

    const activeJobs = useMemo(
        () => jobs.filter((j) => ['queued', 'running', 'paused'].includes(j.status)),
        [jobs],
    );

    const value = useMemo(
        () => ({
            jobs,
            activeJobs,
            enqueueBatch,
            reattachBatch,
            pauseJob,
            resumeJob,
            cancelJob,
            dismissJob,
            getResumableJobForRoute,
            canResumeJob,
        }),
        [
            jobs,
            activeJobs,
            enqueueBatch,
            reattachBatch,
            pauseJob,
            resumeJob,
            cancelJob,
            dismissJob,
            getResumableJobForRoute,
            canResumeJob,
        ],
    );

    return <JobQueueContext.Provider value={value}>{children}</JobQueueContext.Provider>;
}

export function useJobQueue(): JobQueueContextValue {
    const ctx = useContext(JobQueueContext);
    if (!ctx) throw new Error('useJobQueue must be used within JobQueueProvider');
    return ctx;
}
