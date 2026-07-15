export type ToastVariant = 'success' | 'error' | 'info';

export type ToastKind = 'ephemeral' | 'job';

/** Rich context for deep-linking while background work runs. */
export type ToastContext = {
    jobId?: string;
    toolId?: string;
    toolSlug?: string;
    route?: string;
    workspaceId?: string;
};

export type ToastItem = {
    id: string;
    kind: ToastKind;
    title: string;
    message: string;
    variant: ToastVariant;
    duration: number;
    context?: ToastContext;
    progress?: number;
    actionLabel?: string;
};

export type ToastInput = {
    /** Short headline — shown bold in rich toasts */
    title?: string;
    message: string;
    variant?: ToastVariant;
    duration?: number;
    kind?: ToastKind;
    context?: ToastContext;
    progress?: number;
    actionLabel?: string;
    /** Mirror to OS notification when tab is in background */
    notifyInBackground?: boolean;
};

export function jobToastContext(job: {
    id: string;
    context: { route: string; toolId?: string; toolSlug?: string; workspaceId?: string };
}): ToastContext {
    return {
        jobId: job.id,
        route: job.context.route,
        toolId: job.context.toolId,
        toolSlug: job.context.toolSlug,
        workspaceId: job.context.workspaceId,
    };
}
