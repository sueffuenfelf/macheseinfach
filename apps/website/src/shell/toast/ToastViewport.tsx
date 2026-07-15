import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useToast } from './context';
import type { ToastVariant } from './types';

const VARIANT_STYLES: Record<ToastVariant, string> = {
    success: 'bg-[var(--color-success)]',
    error: 'border-[var(--color-danger)] bg-[#fff5f5]',
    info: 'bg-[var(--color-info)]',
};

const VARIANT_ICONS: Record<ToastVariant, string> = {
    success: 'M5 13l4 4L19 7',
    error: 'M6 6l12 12M18 6L6 18',
    info: 'M12 8v5M12 16h.01',
};

export function ToastViewport() {
    const navigate = useNavigate();
    const { toasts, dismiss } = useToast();

    if (toasts.length === 0) return null;

    return createPortal(
        <div
            className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-full max-w-[22rem] flex-col gap-2 px-4 sm:right-6 sm:bottom-6 sm:px-0"
            aria-live="polite"
            aria-relevant="additions"
        >
            {toasts.map((item) => (
                <div
                    key={item.id}
                    role="status"
                    className={`ms-animate-pop pointer-events-auto flex flex-col gap-2 rounded-[12px] border-2 border-black px-3 py-2.5 shadow-brutal ${VARIANT_STYLES[item.variant]}`}
                >
                    <div className="flex items-start gap-2.5">
                        <svg
                            viewBox="0 0 24 24"
                            className="mt-0.5 h-4 w-4 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            aria-hidden="true"
                        >
                            <path d={VARIANT_ICONS[item.variant]} />
                        </svg>
                        <div className="min-w-0 flex-1">
                            <p className="font-display text-[13px] leading-snug font-bold text-[var(--color-ink)]">
                                {item.title}
                            </p>
                            {item.message ? (
                                <p className="mt-0.5 text-[12px] leading-snug text-[var(--color-ink-soft)]">
                                    {item.message}
                                </p>
                            ) : null}
                            {item.context?.toolSlug ? (
                                <p className="mt-1 font-mono text-[10px] text-[var(--color-ink-muted)]">
                                    {item.context.toolSlug}
                                    {item.context.jobId ? ` · ${item.context.jobId.slice(0, 8)}` : ''}
                                </p>
                            ) : null}
                        </div>
                        <button
                            type="button"
                            className="ms-focus shrink-0 rounded-[6px] border-2 border-black bg-white px-1.5 py-0.5 font-display text-[10px] font-bold"
                            aria-label="Hinweis schließen"
                            onClick={() => dismiss(item.id)}
                        >
                            ✕
                        </button>
                    </div>
                    {typeof item.progress === 'number' ? (
                        <div className="h-1 overflow-hidden rounded-full border border-black bg-white/60">
                            <div
                                className="h-full bg-black/70 transition-[width]"
                                style={{ width: `${Math.round(item.progress * 100)}%` }}
                            />
                        </div>
                    ) : null}
                    {item.context?.route && item.actionLabel ? (
                        <button
                            type="button"
                            className="ms-btn w-full py-1 text-[11px]"
                            onClick={() => navigate(item.context!.route!)}
                        >
                            {item.actionLabel}
                        </button>
                    ) : null}
                </div>
            ))}
        </div>,
        document.body,
    );
}
