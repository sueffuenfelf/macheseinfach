import { describe, expect, test } from 'bun:test';
import { analyzeJwt } from './compute';

const SAMPLE_JWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('jwt-inspector compute', () => {
    test('decodes sample jwt header and payload', () => {
        const findings = analyzeJwt(SAMPLE_JWT);
        expect(findings.some((f) => f.id === 'header' && f.detail?.includes('HS256'))).toBe(true);
        expect(findings.some((f) => f.id === 'payload' && f.detail?.includes('John Doe'))).toBe(
            true,
        );
    });

    test('rejects invalid format', () => {
        const findings = analyzeJwt('not.a.jwt.token');
        expect(findings[0]?.severity).toBe('error');
    });
});
