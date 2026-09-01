import { useEffect, useRef, useState } from 'react';
import { useFileDrop } from '../../../../hooks/useFileDrop';
import { formatBytes } from './format-bytes';
import { useObjectUrl } from './useObjectUrl';

export type WorkbenchFile = {
    id: string;
    file: File;
};

type ImageDropStageProps = {
    files: WorkbenchFile[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onFiles: (files: FileList | File[]) => void;
    accept: string;
    working?: boolean;
    resultBlob?: Blob | null;
    emptyTitle: string;
    emptyHint: string;
};

export function ImageDropStage({
    files,
    selectedId,
    onSelect,
    onFiles,
    accept,
    working = false,
    resultBlob = null,
    emptyTitle,
    emptyHint,
}: ImageDropStageProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const selected = files.find((entry) => entry.id === selectedId) ?? files[0] ?? null;
    const previewBlob = resultBlob ?? selected?.file ?? null;
    const previewUrl = useObjectUrl(previewBlob);
    const [broken, setBroken] = useState(false);

    useEffect(() => {
        setBroken(false);
    }, [selected?.id, previewBlob]);

    const apply = (list: File[] | FileList) => {
        const arr = Array.from(list);
        if (arr.length) onFiles(arr);
    };

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((incoming) => apply(incoming));

    return (
        <div
            className="relative flex min-h-0 flex-1 flex-col bg-[var(--color-chip)]"
            data-drag={dragOver}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <input
                ref={inputRef}
                className="ms-sr-only"
                type="file"
                multiple
                accept={accept}
                disabled={working}
                onChange={(event) => {
                    if (event.target.files) apply(event.target.files);
                    event.target.value = '';
                }}
            />

            {selected && previewUrl && !broken ? (
                <div className="relative min-h-0 flex-1">
                    <img
                        src={previewUrl}
                        alt={selected.file.name}
                        className="absolute inset-0 h-full w-full object-contain p-4 md:p-6"
                        onError={() => setBroken(true)}
                    />
                    <div className="pointer-events-none absolute top-3 left-3 rounded-[6px] border-2 border-black bg-white px-2 py-1 font-display text-[11px] font-bold">
                        {selected.file.name}
                        <span className="ml-2 font-sans font-medium text-[var(--color-ink-soft)]">
                            {formatBytes(selected.file.size)}
                            {resultBlob ? ` → ${formatBytes(resultBlob.size)}` : ''}
                        </span>
                    </div>
                    <button
                        type="button"
                        className="ms-focus absolute top-3 right-3 rounded-[6px] border-2 border-black bg-white px-2 py-1 font-display text-[11px] font-bold"
                        onClick={() => inputRef.current?.click()}
                        disabled={working}
                    >
                        Anderes Bild
                    </button>
                </div>
            ) : selected ? (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
                    <p className="font-display text-[16px] font-bold">{selected.file.name}</p>
                    <p className="text-[13px] text-[var(--color-ink-soft)]">
                        Vorschau für dieses Format nicht möglich · {formatBytes(selected.file.size)}
                    </p>
                    <button
                        type="button"
                        className="ms-btn"
                        onClick={() => inputRef.current?.click()}
                        disabled={working}
                    >
                        Anderes Bild
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    className={`ms-focus m-4 flex min-h-[42vh] flex-1 flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-black px-6 text-center md:m-6 ${
                        dragOver ? 'bg-white' : 'bg-transparent'
                    }`}
                    onClick={() => inputRef.current?.click()}
                >
                    <p className="font-display text-[22px] font-bold tracking-[-0.03em]">{emptyTitle}</p>
                    <p className="mt-2 max-w-sm text-[14px] text-[var(--color-ink-soft)]">{emptyHint}</p>
                    <span className="ms-btn mt-5">Bild ablegen oder wählen</span>
                </button>
            )}

            {files.length > 1 ? (
                <ul
                    className="flex shrink-0 gap-2 overflow-x-auto border-t-2 border-black bg-white px-3 py-2"
                    role="list"
                    aria-label="Ausgewählte Bilder"
                >
                    {files.map((entry) => (
                        <li key={entry.id} className="shrink-0">
                            <FilmstripThumb
                                file={entry.file}
                                selected={entry.id === selected?.id}
                                onClick={() => onSelect(entry.id)}
                            />
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}

function FilmstripThumb({
    file,
    selected,
    onClick,
}: {
    file: File;
    selected: boolean;
    onClick: () => void;
}) {
    const url = useObjectUrl(file);
    return (
        <button
            type="button"
            onClick={onClick}
            className="ms-focus h-14 w-14 overflow-hidden rounded-[8px] border-2 border-black bg-[var(--color-chip)]"
            aria-current={selected ? 'true' : undefined}
            aria-label={file.name}
            {...(selected ? { 'data-active': true } : {})}
            style={selected ? { outline: '2px solid var(--color-accent)', outlineOffset: '2px' } : undefined}
        >
            {url ? (
                <img src={url} alt="" className="h-full w-full object-cover" />
            ) : (
                <span className="p-1 font-display text-[9px]">{file.name.slice(0, 6)}</span>
            )}
        </button>
    );
}
