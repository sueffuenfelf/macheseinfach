import { useEffect } from 'react';
import type { ToolId } from '../../../data/catalog/types';
import { useIncomingImageArtifact } from './useIncomingImageArtifact';
import { ContinueWithNextTool } from './ContinueWithNextTool';

type UseImageToolSessionOptions = {
    toolId: ToolId;
    onIncomingFile: (file: File) => void;
};

/** Wire session artifact into tool file list on navigation from „Weiter mit …“. */
export function useImageToolSession({ onIncomingFile }: UseImageToolSessionOptions): void {
    const { incomingFile, clearIncoming } = useIncomingImageArtifact();

    useEffect(() => {
        if (!incomingFile) return;
        onIncomingFile(incomingFile);
        clearIncoming();
    }, [clearIncoming, incomingFile, onIncomingFile]);
}

export { ContinueWithNextTool };
