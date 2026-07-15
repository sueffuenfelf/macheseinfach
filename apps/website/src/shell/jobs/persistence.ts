import type { JobRecord } from './types';

const STORAGE_KEY = 'msf.jobs.v1';

export function loadPersistedJobs(): JobRecord[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as JobRecord[];
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((job) => job?.id && job?.context?.route);
    } catch {
        return [];
    }
}

export function savePersistedJobs(jobs: JobRecord[]): void {
    try {
        const resumable = jobs.filter((job) =>
            ['queued', 'running', 'paused'].includes(job.status),
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resumable));
    } catch {
        /* quota / private mode */
    }
}

export function clearFinishedPersistedJobs(jobs: JobRecord[]): void {
    savePersistedJobs(jobs.filter((job) => ['queued', 'running', 'paused'].includes(job.status)));
}
