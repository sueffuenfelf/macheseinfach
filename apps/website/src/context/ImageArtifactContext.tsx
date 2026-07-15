import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import {
    createImageArtifactFromBlob,
    getImageArtifact,
    getImageArtifactAsync,
    hydrateImageArtifactsFromIdb,
    putImageArtifact,
    type ImageArtifact,
} from '../tools/_shared/image/artifact-store';

type ImageArtifactContextValue = {
    /** Artifact queued for the next tool page (session-only). */
    pendingArtifactId: string | null;
    setPendingArtifactId: (id: string | null) => void;
    getArtifact: (id: string) => ImageArtifact | undefined;
    getArtifactAsync: (id: string) => Promise<ImageArtifact | undefined>;
    putArtifact: (artifact: ImageArtifact) => void;
    createFromBlob: (blob: Blob, filename: string) => Promise<ImageArtifact>;
};

const ImageArtifactContext = createContext<ImageArtifactContextValue | null>(null);

export function ImageArtifactProvider({ children }: { children: ReactNode }) {
    const [pendingArtifactId, setPendingArtifactId] = useState<string | null>(null);
    useEffect(() => {
        void hydrateImageArtifactsFromIdb();
    }, []);

    const getArtifact = useCallback((id: string) => getImageArtifact(id), []);
    const getArtifactAsync = useCallback((id: string) => getImageArtifactAsync(id), []);
    const putArtifact = useCallback((artifact: ImageArtifact) => putImageArtifact(artifact), []);
    const createFromBlob = useCallback(
        (blob: Blob, filename: string) => createImageArtifactFromBlob(blob, filename),
        [],
    );

    const value = useMemo<ImageArtifactContextValue>(
        () => ({
            pendingArtifactId,
            setPendingArtifactId,
            getArtifact,
            getArtifactAsync,
            putArtifact,
            createFromBlob,
        }),
        [createFromBlob, getArtifact, getArtifactAsync, pendingArtifactId, putArtifact],
    );

    return <ImageArtifactContext.Provider value={value}>{children}</ImageArtifactContext.Provider>;
}

export function useImageArtifacts(): ImageArtifactContextValue {
    const ctx = useContext(ImageArtifactContext);
    if (!ctx) {
        throw new Error('useImageArtifacts must be used within ImageArtifactProvider');
    }
    return ctx;
}

export function useOptionalImageArtifacts(): ImageArtifactContextValue | null {
    return useContext(ImageArtifactContext);
}
