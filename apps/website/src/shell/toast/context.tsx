import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import type { ToastInput, ToastItem } from './types';

const DEFAULT_DURATION = 3000;

type ToastContextValue = {
    toasts: ToastItem[];
    toast: (input: ToastInput | string) => string;
    dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function normalizeInput(input: ToastInput | string): ToastInput {
    if (typeof input === 'string') return { message: input, variant: 'success' };
    return input;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const timersRef = useRef<Map<string, number>>(new Map());

    const dismiss = useCallback((id: string) => {
        const timer = timersRef.current.get(id);
        if (timer) {
            window.clearTimeout(timer);
            timersRef.current.delete(id);
        }
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback(
        (input: ToastInput | string) => {
            const { message, variant = 'success', duration = DEFAULT_DURATION } = normalizeInput(input);
            const id = crypto.randomUUID();
            const item: ToastItem = { id, message, variant, duration };

            setToasts((prev) => [...prev, item].slice(-5));

            const timer = window.setTimeout(() => dismiss(id), duration);
            timersRef.current.set(id, timer);

            return id;
        },
        [dismiss],
    );

    const value = useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss]);

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
