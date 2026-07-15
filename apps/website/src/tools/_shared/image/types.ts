export type ImageFormatId = 'heic' | 'png' | 'jpg' | 'webp' | 'tiff' | 'avif' | 'gif';

export type ImageFormatStatus = 'live' | 'planned';

export type ImageFormat = {
    readonly id: ImageFormatId;
    readonly label: string;
    readonly mime: string;
    readonly extensions: readonly string[];
    readonly convertTo: readonly ImageFormatId[];
    readonly status: ImageFormatStatus;
};

export type ConvertOptions = {
    quality?: number;
};

export type ImageArtifact = {
    id: string;
    blob: Blob;
    filename: string;
    mime: string;
    width: number;
    height: number;
    byteSize: number;
};
