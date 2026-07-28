import { sha1HexUpper } from './crypto';

const PWNED_PASSWORDS_RANGE = 'https://api.pwnedpasswords.com/range';

export type PwnedPasswordResult = {
    /** Number of times seen in breaches; 0 = not found. */
    count: number;
    /** First 5 chars of SHA-1 hash (what leaves the browser). */
    hashPrefix: string;
};

/**
 * Check a password against HIBP Pwned Passwords using k-anonymity.
 * Only the first 5 characters of the SHA-1 hash are sent over the network.
 */
export async function checkPwnedPassword(password: string): Promise<PwnedPasswordResult> {
    const hash = await sha1HexUpper(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch(`${PWNED_PASSWORDS_RANGE}/${prefix}`, {
        headers: { 'Add-Padding': 'true' },
    });
    if (!response.ok) {
        throw new Error(`HIBP-Anfrage fehlgeschlagen (${response.status}).`);
    }

    const body = await response.text();
    for (const line of body.split('\n')) {
        const [hashSuffix, countStr] = line.trim().split(':');
        if (hashSuffix?.toUpperCase() === suffix) {
            return { count: Number.parseInt(countStr ?? '0', 10) || 0, hashPrefix: prefix };
        }
    }
    return { count: 0, hashPrefix: prefix };
}
