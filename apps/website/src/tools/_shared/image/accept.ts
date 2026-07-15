export const IMAGE_ACCEPT = '.heic,.heif,.png,.jpg,.jpeg,.webp';

const IMAGE_EXTENSION_RE = /\.(heic|heif|png|jpe?g|webp)$/i;

export function isAcceptedImageFile(file: File): boolean {
    if (file.type.startsWith('image/')) return true;
    return IMAGE_EXTENSION_RE.test(file.name);
}

export function filterAcceptedImageFiles(files: FileList | readonly File[]): File[] {
    return Array.from(files).filter(isAcceptedImageFile);
}
