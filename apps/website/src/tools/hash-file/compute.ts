import { sha256Hex } from '../_shared/security/crypto';
import type { ExtractField } from '../_shared/shells';

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** SHA-256 checksum of an uploaded file — client-side via Web Crypto. */
export async function extractFileHash(input: {
    text?: string;
    file?: File;
}): Promise<ExtractField[]> {
    if (!input.file) {
        throw new Error('Bitte eine Datei auswählen.');
    }

    const buffer = await input.file.arrayBuffer();
    const hash = await sha256Hex(buffer);

    return [
        { id: 'filename', label: 'Dateiname', value: input.file.name },
        { id: 'size', label: 'Größe', value: formatBytes(input.file.size) },
        { id: 'sha256', label: 'SHA-256', value: hash, mono: true },
    ];
}
