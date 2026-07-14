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
    const { toasts, dismiss } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div
            className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-full max-w-[22rem] flex-col gap-2 px-4 sm:right-6 sm:bottom-6 sm:px-0"
            aria-live="polite"
            aria-relevant="additions"
        >
            {toasts.map((item) => (
                <div
                    key={item.id}
                    role="status"
                    className={`ms-animate-pop pointer-events-auto flex items-start gap-2.5 rounded-[12px] border-2 border-black px-3 py-2.5 shadow-brutal ${VARIANT_STYLES[item.variant]}`}
                >
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
                    <p className="min-w-0 flex-1 font-display text-[13px] leading-snug font-semibold text-[var(--color-ink)]">
                        {item.message}
                    </p>
                    <button
                        type="button"
                        className="ms-focus shrink-0 rounded-[6px] border-2 border-black bg-white px-1.5 py-0.5 font-display text-[10px] font-bold"
                        aria-label="Hinweis schließen"
                        onClick={() => dismiss(item.id)}
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}
