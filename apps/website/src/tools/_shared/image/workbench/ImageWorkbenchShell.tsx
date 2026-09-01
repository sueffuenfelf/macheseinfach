import { useRef, type ReactNode } from 'react';
import { useFileDrop } from '../../../../hooks/useFileDrop';
import { ImageDisplayStage, type ImageDisplayKind } from './display';
import { ImageThumbRail } from './ImageThumbRail';
import type { WorkbenchFile } from './ImageDropStage';

type ImageWorkbenchShellProps = {
    files: WorkbenchFile[];
    selectedId: string | null;
    onSelectFile: (id: string) => void;
    onFiles: (files: File[] | FileList) => void;
    accept: string;
    working?: boolean;
    beforeBlob?: Blob | null;
    afterBlob?: Blob | null;
    afterLoading?: boolean;
    display?: ImageDisplayKind;
    emptyTitle: string;
    emptyHint: string;
    beforeLabel?: string;
    afterLabel?: string;
    rail: ReactNode;
};

/** Three columns: thumbs | stage (pluggable display) | tool rail. */
export function ImageWorkbenchShell({
    files,
    selectedId,
    onSelectFile,
    onFiles,
    accept,
    working = false,
    beforeBlob = null,
    afterBlob = null,
    afterLoading = false,
    display = 'fit',
    emptyTitle,
    emptyHint,
    beforeLabel,
    afterLabel,
    rail,
}: ImageWorkbenchShellProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const selected = files.find((entry) => entry.id === selectedId) ?? files[0] ?? null;

    const apply = (list: File[] | FileList) => {
        const arr = Array.from(list);
        if (arr.length) onFiles(arr);
    };

    const { dragOver, onDragLeave, onDragOver, onDrop } = useFileDrop((incoming) => apply(incoming));

    return (
        <div
            className="flex h-full min-h-0 flex-1 flex-col md:flex-row"
            data-testid="image-workbench"
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

            <ImageThumbRail
                files={files}
                selectedId={selected?.id ?? null}
                onSelect={onSelectFile}
                onAddClick={() => inputRef.current?.click()}
                working={working}
            />

            <div
                className="relative min-h-0 min-w-0 flex-1 bg-[var(--color-chip)]"
                data-drag={dragOver}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                {selected && beforeBlob ? (
                    <ImageDisplayStage
                        kind={display}
                        before={beforeBlob}
                        after={afterBlob}
                        afterLoading={afterLoading}
                        alt={selected.file.name}
                        beforeLabel={beforeLabel}
                        afterLabel={afterLabel}
                    />
                ) : (
                    <button
                        type="button"
                        className={`ms-focus absolute inset-3 flex flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-black px-6 text-center ${
                            dragOver ? 'bg-white' : ''
                        }`}
                        onClick={() => inputRef.current?.click()}
                    >
                        <p className="font-display text-[22px] font-bold tracking-[-0.03em]">
                            {emptyTitle}
                        </p>
                        <p className="mt-2 max-w-sm text-[14px] text-[var(--color-ink-soft)]">
                            {emptyHint}
                        </p>
                        <span className="ms-btn mt-5">Bild ablegen oder wählen</span>
                    </button>
                )}
            </div>

            <aside
                className="flex shrink-0 flex-col gap-5 border-t-2 border-black bg-white px-4 py-4 md:w-[17.5rem] md:overflow-y-auto md:border-t-0 md:border-l-2 md:px-5 md:py-5"
                aria-label="Werkzeug"
            >
                {rail}
            </aside>
        </div>
    );
}
