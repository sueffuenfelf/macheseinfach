import { useEffect, useRef, useState } from 'react';
import { useDismissLayer } from './useDismissLayer';

type WorkspaceTitleEditorProps = {
    name: string;
    onRename: (name: string) => void;
    renameRequestId?: number;
};

export function WorkspaceTitleEditor({
    name,
    onRename,
    renameRequestId = 0,
}: WorkspaceTitleEditorProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!editing) setDraft(name);
    }, [editing, name]);

    useEffect(() => {
        if (renameRequestId === 0) return;
        setDraft(name);
        setEditing(true);
    }, [name, renameRequestId]);

    useDismissLayer(editing, () => {
        setDraft(name);
        setEditing(false);
    });

    useEffect(() => {
        if (!editing) return;
        inputRef.current?.focus();
        inputRef.current?.select();
    }, [editing]);

    function cancel() {
        setDraft(name);
        setEditing(false);
    }

    function confirm() {
        const trimmed = draft.trim();
        if (!trimmed || trimmed === name) {
            cancel();
            return;
        }
        onRename(trimmed);
        setEditing(false);
    }

    function startEditing() {
        setDraft(name);
        setEditing(true);
    }

    if (editing) {
        return (
            <div className="flex flex-wrap items-center gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    className="ms-input ms-focus min-w-[12rem] max-w-full py-1.5 px-2.5 font-display text-[30px] font-bold leading-tight tracking-[-0.02em]"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            confirm();
                        }
                    }}
                    aria-label="Arbeitsbereich umbenennen"
                />
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        className="ms-focus inline-flex h-9 w-9 items-center justify-center rounded-[8px] border-2 border-black bg-[var(--color-brand)] text-white shadow-[2px_2px_0_#000] transition hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#000]"
                        onClick={confirm}
                        aria-label="Umbenennung speichern"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        className="ms-focus inline-flex h-9 w-9 items-center justify-center rounded-[8px] border-2 border-black bg-white shadow-[2px_2px_0_#000] transition hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#000]"
                        onClick={cancel}
                        aria-label="Umbenennung abbrechen"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="group inline-flex max-w-full items-center gap-1.5">
            <h1 className="font-display text-[30px] font-bold tracking-[-0.02em]">{name}</h1>
            <button
                type="button"
                className="ms-focus inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border-2 border-black bg-white opacity-0 shadow-[2px_2px_0_#000] transition hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-brutal group-hover:opacity-100 focus-visible:opacity-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#000]"
                onClick={startEditing}
                aria-label="Arbeitsbereich umbenennen"
            >
                <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
            </button>
        </div>
    );
}
