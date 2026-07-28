import { describe, expect, test } from 'bun:test';
import { analyzePgpKey } from './compute';

const SAMPLE_PUBLIC_KEY = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Comment: Test User <test@example.com>
Version: OpenPGP.js v5

mQENBFyqA8YBCAD...
-----END PGP PUBLIC KEY BLOCK-----`;

describe('pgp-key-info compute', () => {
    test('parses public key block metadata', () => {
        const findings = analyzePgpKey(SAMPLE_PUBLIC_KEY);
        expect(findings.some((f) => f.title.includes('PUBLIC KEY'))).toBe(true);
        expect(findings.some((f) => f.detail?.includes('test@example.com'))).toBe(true);
    });

    test('rejects missing block', () => {
        const findings = analyzePgpKey('not a key');
        expect(findings[0]?.severity).toBe('error');
    });
});
