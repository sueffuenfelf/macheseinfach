import { useCallback, useState, type DragEvent } from 'react';

export function useFileDrop(onFiles: (files: FileList) => void) {
    const [dragOver, setDragOver] = useState(false);

    const onDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const onDragLeave = useCallback(() => setDragOver(false), []);

    const onDrop = useCallback(
        (e: DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
        },
        [onFiles],
    );

    return { dragOver, onDragOver, onDragLeave, onDrop };
}

export const FILE_ACCEPT = '.pdf,.heic,.heif,.png,.jpg,.jpeg,.tiff';
