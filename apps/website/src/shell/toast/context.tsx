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
import { useSettings } from '../../context/SettingsContext';
import { maybeShowSystemNotification, setToastNavigateHandler } from './notifications';
import type { ToastInput, ToastItem } from './types';

const DEFAULT_DURATION = 3000;
const JOB_DURATION = 8000;

type ToastContextValue = {
    toasts: ToastItem[];
    toast: (input: ToastInput | string) => string;
    dismiss: (id: string) => void;
    updateToast: (id: string, patch: Partial<ToastItem>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function normalizeInput(input: ToastInput | string): ToastInput {
    if (typeof input === 'string') return { message: input, variant: 'success' };
    return input;
}

export function ToastProvider({
    children,
    onNavigate,
}: {
    children: ReactNode;
    onNavigate?: (href: string) => void;
}) {
    const { settings } = useSettings();
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const timersRef = useRef<Map<string, number>>(new Map());

    useEffect(() => {
        if (onNavigate) setToastNavigateHandler(onNavigate);
    }, [onNavigate]);

    const dismiss = useCallback((id: string) => {
        const timer = timersRef.current.get(id);
        if (timer) {
            window.clearTimeout(timer);
            timersRef.current.delete(id);
        }
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const updateToast = useCallback((id: string, patch: Partial<ToastItem>) => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    }, []);

    const toast = useCallback(
        (input: ToastInput | string) => {
            const normalized = normalizeInput(input);
            const {
                title,
                message,
                variant = 'success',
                duration,
                kind = 'ephemeral',
                context,
                progress,
                actionLabel,
                notifyInBackground = true,
            } = normalized;

            const resolvedDuration = duration ?? (kind === 'job' ? JOB_DURATION : DEFAULT_DURATION);
            const id = crypto.randomUUID();
            const item: ToastItem = {
                id,
                kind,
                title: title ?? message,
                message: title ? message : '',
                variant,
                duration: resolvedDuration,
                context,
                progress,
                actionLabel: actionLabel ?? (context?.route ? 'Anzeigen' : undefined),
            };

            setToasts((prev) => {
                const withoutJobDup =
                    kind === 'job' && context?.jobId
                        ? prev.filter((t) => t.context?.jobId !== context.jobId)
                        : prev;
                return [...withoutJobDup, item].slice(-6);
            });

            if (resolvedDuration > 0 && kind !== 'job') {
                const timer = window.setTimeout(() => dismiss(id), resolvedDuration);
                timersRef.current.set(id, timer);
            }

            if (notifyInBackground) {
                maybeShowSystemNotification(item, settings);
            }

            return id;
        },
        [dismiss, settings],
    );

    const value = useMemo(
        () => ({ toasts, toast, dismiss, updateToast }),
        [toasts, toast, dismiss, updateToast],
    );

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
