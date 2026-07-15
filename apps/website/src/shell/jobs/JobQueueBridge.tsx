import { useMemo, useRef, type ReactNode } from 'react';
import { useToast } from '../toast';
import { jobToastContext } from '../toast/types';
import { JobQueueProvider, type JobQueueNotifier } from './context';

export function JobQueueBridge({ children }: { children: ReactNode }) {
    const { toast, updateToast, dismiss } = useToast();
    const toastIdsRef = useRef<Map<string, string>>(new Map());

    const notifier = useMemo<JobQueueNotifier>(
        () => ({
            onJobQueued(job) {
                const toastId = toast({
                    kind: 'job',
                    title: job.context.label,
                    message: `Gestartet — ${job.items.length} Einträge`,
                    variant: 'info',
                    duration: 0,
                    progress: 0,
                    context: jobToastContext(job),
                    notifyInBackground: true,
                });
                toastIdsRef.current.set(job.id, toastId);
            },
            onJobProgress(job) {
                const toastId = toastIdsRef.current.get(job.id);
                if (!toastId) return;
                const done = job.items.filter((i) => i.status === 'done').length;
                updateToast(toastId, {
                    progress: job.progress,
                    message: `${done} / ${job.items.length} erledigt`,
                    variant: 'info',
                });
            },
            onJobPaused(job) {
                const toastId = toastIdsRef.current.get(job.id);
                if (toastId) {
                    updateToast(toastId, {
                        message: `Pausiert bei ${job.resumeIndex + 1} / ${job.items.length}`,
                        variant: 'info',
                    });
                }
                toast({
                    title: job.context.label,
                    message: 'Im Hintergrund pausiert — im Job-Panel fortsetzen.',
                    variant: 'info',
                    context: jobToastContext(job),
                    notifyInBackground: true,
                });
            },
            onJobCompleted(job) {
                const toastId = toastIdsRef.current.get(job.id);
                if (toastId) {
                    updateToast(toastId, {
                        progress: 1,
                        message: `${job.items.length} Einträge fertig`,
                        variant: 'success',
                    });
                    window.setTimeout(() => dismiss(toastId), 5000);
                }
                toast({
                    title: job.context.label,
                    message: 'Alle Einträge erfolgreich verarbeitet.',
                    variant: 'success',
                    context: jobToastContext(job),
                    notifyInBackground: true,
                });
                toastIdsRef.current.delete(job.id);
            },
            onJobFailed(job) {
                const toastId = toastIdsRef.current.get(job.id);
                if (toastId) dismiss(toastId);
                toast({
                    title: job.context.label,
                    message: job.error ?? 'Verarbeitung fehlgeschlagen',
                    variant: 'error',
                    context: jobToastContext(job),
                    notifyInBackground: true,
                });
                toastIdsRef.current.delete(job.id);
            },
            onJobCancelled(job) {
                const toastId = toastIdsRef.current.get(job.id);
                if (toastId) dismiss(toastId);
                toast({
                    title: job.context.label,
                    message: 'Abgebrochen',
                    variant: 'info',
                    context: jobToastContext(job),
                });
                toastIdsRef.current.delete(job.id);
            },
        }),
        [dismiss, toast, updateToast],
    );

    return <JobQueueProvider notifier={notifier}>{children}</JobQueueProvider>;
}
