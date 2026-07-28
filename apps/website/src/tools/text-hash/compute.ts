import type { FieldValues, GenerateOutput } from '../_shared/shells';

function toHex(buffer: ArrayBuffer): string {
    return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** SHA-256 (default) or SHA-1 hash of UTF-8 text. */
export async function generateTextHash(values: FieldValues): Promise<GenerateOutput> {
    const text = values.text ?? '';
    if (!text) return null;
    const algo = values.algo === 'SHA-1' ? 'SHA-1' : 'SHA-256';
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest(algo, bytes);
    const hex = toHex(digest);
    return {
        kind: 'code',
        content: `${algo}\n${hex}`,
        language: 'text',
        filename: 'hash.txt',
    };
}
