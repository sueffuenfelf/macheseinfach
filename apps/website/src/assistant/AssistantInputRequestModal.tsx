import { useEffect, useRef, useState, type RefObject } from 'react';
import type { UserInputKind, UserInputRequest } from '@macheseinfach/assistant-core';

export type InputRequestState = {
    request: UserInputRequest;
    resolve: (result: { files?: File[]; text?: string } | { cancelled: true }) => void;
};

type AssistantInputRequestModalProps = {
    state: InputRequestState | null;
};

function kindLabel(kind: UserInputKind): string {
    switch (kind) {
        case 'file':
            return 'Datei';
        case 'files':
            return 'Dateien';
        case 'text':
            return 'Text';
        case 'multiline':
            return 'Mehrzeiliger Text';
    }
}

export function AssistantInputRequestModal({ state }: AssistantInputRequestModalProps) {
    const [text, setText] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!state) return;
        setText('');
        setFiles([]);
        const focusTimer = window.setTimeout(() => {
            if (state.request.kind === 'text' || state.request.kind === 'multiline') {
                textareaRef.current?.focus();
            } else {
                fileInputRef.current?.focus();
            }
        }, 0);
        return () => window.clearTimeout(focusTimer);
    }, [state]);

    if (!state) return null;

    const { request, resolve } = state;
    const isText = request.kind === 'text' || request.kind === 'multiline';

    function onCancel() {
        resolve({ cancelled: true });
    }

    function onSubmit() {
        if (isText) {
            if (!text.trim()) return;
            resolve({ text: text.trim() });
            return;
        }
        if (!files.length) return;
        resolve({ files });
    }

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center"
            role="presentation"
            onClick={onCancel}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="assistant-input-request-title"
                className="w-full max-w-md rounded-xl border-2 border-black bg-white p-4 shadow-brutal-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <p className="font-display text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--color-ink-muted)]">
                    {kindLabel(request.kind)} benötigt
                </p>
                <h2
                    id="assistant-input-request-title"
                    className="mt-1 font-display text-[16px] font-bold leading-snug"
                >
                    {request.prompt}
                </h2>

                <div className="mt-4 space-y-3">
                    {isText ? (
                        request.kind === 'multiline' ? (
                            <textarea
                                ref={textareaRef}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={5}
                                className="ms-input ms-focus w-full resize-y text-[14px]"
                                placeholder="Hier eingeben …"
                                aria-label="Texteingabe"
                            />
                        ) : (
                            <input
                                ref={textareaRef as unknown as RefObject<HTMLInputElement>}
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="ms-input ms-focus w-full text-[14px]"
                                placeholder="Hier eingeben …"
                                aria-label="Texteingabe"
                            />
                        )
                    ) : (
                        <div className="rounded-[10px] border-2 border-dashed border-black bg-[var(--color-chip)] p-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={request.accept}
                                multiple={request.kind === 'files'}
                                className="w-full text-[13px]"
                                onChange={(e) => {
                                    const list = e.target.files;
                                    setFiles(list ? [...list] : []);
                                }}
                                aria-label="Datei auswählen"
                            />
                            {files.length ? (
                                <ul className="mt-2 space-y-1 text-[12px] text-[var(--color-ink-soft)]">
                                    {files.map((file) => (
                                        <li key={`${file.name}-${file.size}`}>{file.name}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-2 text-[12px] text-[var(--color-ink-soft)]">
                                    Datei hier auswählen — bleibt lokal auf deinem Gerät.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={onCancel} className="ms-btn ms-focus px-4">
                        Abbrechen
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isText ? !text.trim() : files.length === 0}
                        className="ms-btn-primary ms-focus px-4 disabled:opacity-50"
                    >
                        Übernehmen
                    </button>
                </div>
            </div>
        </div>
    );
}
