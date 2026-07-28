import type { FieldValues, GenerateOutput } from '../_shared/shells';

function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
    const binary = atob(b64.replace(/\s+/g, ''));
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
}

/** Encode or decode Base64 (UTF-8 text). */
export function generateBase64(values: FieldValues): GenerateOutput {
    const text = values.text ?? '';
    if (!text) return null;
    const mode = values.mode ?? 'encode';

    if (mode === 'encode') {
        const bytes = new TextEncoder().encode(text);
        return {
            kind: 'code',
            content: bytesToBase64(bytes),
            language: 'text',
            filename: 'encoded.b64',
        };
    }

    try {
        const bytes = base64ToBytes(text.trim());
        const decoded = new TextDecoder().decode(bytes);
        return {
            kind: 'text',
            content: decoded,
            filename: 'decoded.txt',
        };
    } catch {
        return {
            kind: 'text',
            content: 'Fehler: Ungültiges Base64.',
            filename: 'error.txt',
        };
    }
}
