import { useEffect, useState } from 'react';
import { useImageArtifacts } from '../../../context/ImageArtifactContext';
import { artifactToFile } from '../image/artifact-store';

/** Load pending artifact from session store as initial file entry. */
export function useIncomingImageArtifact(): {
    incomingFile: File | null;
    clearIncoming: () => void;
} {
    const { pendingArtifactId, setPendingArtifactId, getArtifactAsync } = useImageArtifacts();
    const [incomingFile, setIncomingFile] = useState<File | null>(null);

    useEffect(() => {
        if (!pendingArtifactId) {
            setIncomingFile(null);
            return;
        }
        let cancelled = false;
        void getArtifactAsync(pendingArtifactId).then((artifact) => {
            if (cancelled) return;
            if (artifact) {
                setIncomingFile(artifactToFile(artifact));
            } else {
                setPendingArtifactId(null);
                setIncomingFile(null);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [getArtifactAsync, pendingArtifactId, setPendingArtifactId]);

    function clearIncoming() {
        setPendingArtifactId(null);
        setIncomingFile(null);
    }

    return { incomingFile, clearIncoming };
}
