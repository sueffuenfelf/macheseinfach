import { useNavigate } from 'react-router-dom';
import { useJobQueue } from './context';
import type { JobRecord } from './types';

function formatProgress(job: JobRecord): string {
    const done = job.items.filter((i) => i.status === 'done').length;
    return `${done}/${job.items.length}`;
}

export function JobDock() {
    const navigate = useNavigate();
    const { activeJobs, pauseJob, resumeJob, cancelJob, canResumeJob } = useJobQueue();

    if (activeJobs.length === 0) return null;

    return (
        <aside
            className="pointer-events-none fixed bottom-4 left-4 z-[55] flex w-full max-w-[20rem] flex-col gap-2 px-4 sm:bottom-6 sm:left-6 sm:px-0"
            aria-label="Hintergrund-Aufgaben"
        >
            {activeJobs.map((job) => {
                const resumable = canResumeJob(job.id);
                const isRunning = job.status === 'running';
                const isPaused = job.status === 'paused' || job.status === 'queued';

                return (
                    <div
                        key={job.id}
                        className="pointer-events-auto rounded-[12px] border-2 border-black bg-white px-3 py-2.5 shadow-brutal"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="truncate font-display text-[13px] font-bold">
                                    {job.context.label}
                                </p>
                                <p className="mt-0.5 text-[11px] text-[var(--color-ink-soft)]">
                                    {isRunning ? 'Läuft' : isPaused ? 'Pausiert' : job.status} ·{' '}
                                    {formatProgress(job)}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="shrink-0 font-display text-[11px] font-semibold underline decoration-dotted"
                                onClick={() => navigate(job.context.route)}
                            >
                                Öffnen
                            </button>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full border border-black bg-[var(--color-chip)]">
                            <div
                                className="h-full bg-[var(--color-success)] transition-[width]"
                                style={{ width: `${Math.round(job.progress * 100)}%` }}
                            />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {isRunning ? (
                                <button
                                    type="button"
                                    className="ms-btn px-2 py-0.5 text-[11px]"
                                    onClick={() => pauseJob(job.id)}
                                >
                                    Pause
                                </button>
                            ) : null}
                            {isPaused && resumable ? (
                                <button
                                    type="button"
                                    className="ms-btn px-2 py-0.5 text-[11px]"
                                    onClick={() => resumeJob(job.id)}
                                >
                                    Fortsetzen
                                </button>
                            ) : null}
                            {isPaused && !resumable ? (
                                <span className="text-[10px] text-[var(--color-ink-muted)]">
                                    Zum Fortsetzen Tool erneut öffnen
                                </span>
                            ) : null}
                            <button
                                type="button"
                                className="ms-btn px-2 py-0.5 text-[11px]"
                                onClick={() => cancelJob(job.id)}
                            >
                                Abbrechen
                            </button>
                        </div>
                    </div>
                );
            })}
        </aside>
    );
}
