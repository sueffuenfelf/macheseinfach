/** SHA-1 hex digest (uppercase) — used for HIBP Pwned Passwords k-anonymity. */
export async function sha1HexUpper(input: string): Promise<string> {
    const data = new TextEncoder().encode(input);
    const hash = await crypto.subtle.digest('SHA-1', data);
    return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** SHA-256 hex digest (lowercase) — used for file checksums. */
export async function sha256Hex(input: ArrayBuffer | Uint8Array): Promise<string> {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    const hash = await crypto.subtle.digest('SHA-256', bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Base64url decode (JWT segments). */
export function base64UrlDecode(segment: string): string {
    const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
    const binary = atob(padded + pad);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}
