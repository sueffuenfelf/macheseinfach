import { useDismissLayer } from '../shell/useDismissLayer';

type FlowLeaveConfirmProps = {
    open: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

/** Confirm before clearing Vorhaben context / leaving with filled slots. */
export function FlowLeaveConfirm({
    open,
    title = 'Kontext löschen?',
    message = 'Gespeicherte Eingaben in diesem Vorhaben gehen verloren. Passwörter werden immer gelöscht.',
    confirmLabel = 'Löschen und verlassen',
    cancelLabel = 'Abbrechen',
    onConfirm,
    onCancel,
}: FlowLeaveConfirmProps) {
    useDismissLayer(open, onCancel);

    if (!open) return null;

    return (
        <>
            <button
                type="button"
                className="fixed inset-0 z-[60] cursor-default bg-black/40"
                aria-label="Dialog schließen"
                onClick={onCancel}
            />
            <div className="pointer-events-none fixed inset-0 z-[61] flex items-end justify-center p-4 sm:items-center">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="flow-leave-title"
                    className="pointer-events-auto w-full max-w-md rounded-[14px] border-2 border-black bg-white p-5 shadow-brutal"
                >
                    <h2
                        id="flow-leave-title"
                        className="font-display text-[20px] font-bold tracking-[-0.02em]"
                    >
                        {title}
                    </h2>
                    <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-ink-soft)]">
                        {message}
                    </p>
                    <div className="mt-5 flex flex-wrap justify-end gap-2">
                        <button type="button" className="ms-btn" onClick={onCancel}>
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            className="ms-btn bg-black text-white"
                            onClick={onConfirm}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
