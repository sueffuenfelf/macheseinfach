import { useCallback, useState, type DragEvent } from 'react';

type UseFileDropOptions = {
    filter?: (files: File[]) => File[];
};

export function useFileDrop(onFiles: (files: File[]) => void, options?: UseFileDropOptions) {
    const [dragOver, setDragOver] = useState(false);

    const applyFiles = useCallback(
        (files: File[]) => {
            const next = options?.filter ? options.filter(files) : files;
            if (next.length > 0) onFiles(next);
        },
        [onFiles, options?.filter],
    );

    const onDragOver = useCallback((event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
        setDragOver(true);
    }, []);

    const onDragLeave = useCallback((event: DragEvent) => {
        event.preventDefault();
        const related = event.relatedTarget as Node | null;
        if (related && event.currentTarget.contains(related)) return;
        setDragOver(false);
    }, []);

    const onDrop = useCallback(
        (event: DragEvent) => {
            event.preventDefault();
            event.stopPropagation();
            setDragOver(false);
            if (event.dataTransfer.files.length) {
                applyFiles(Array.from(event.dataTransfer.files));
            }
        },
        [applyFiles],
    );

    return { dragOver, onDragOver, onDragLeave, onDrop, applyFiles };
}

export const FILE_ACCEPT = '.pdf,.heic,.heif,.png,.jpg,.jpeg,.tiff';
