import { useObjectUrl } from '../useObjectUrl';

type ImageDisplayFitProps = {
    blob: Blob;
    alt: string;
};

/** Single image, contained in the stage. */
export function ImageDisplayFit({ blob, alt }: ImageDisplayFitProps) {
    const url = useObjectUrl(blob);
    if (!url) return null;
    return (
        <img
            src={url}
            alt={alt}
            className="absolute inset-0 h-full w-full object-contain p-4 md:p-5"
        />
    );
}
